import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/database/prisma.service';
import { Gender, TrackDifficulty } from '../src/generated/prisma/client';

type LoginBody = {
  accessToken: string;
  user: { id: string; nickname: string };
};

type LeaderboardBody = {
  entries: Array<{ id: string; isCurrent: boolean }>;
};

function bodyOf<T>(response: { text: string }): T {
  return JSON.parse(response.text) as T;
}

describe('HTTP API (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let agent: ReturnType<typeof request.agent>;
  let accessToken = '';
  let trackId = '';
  let userId = '';
  const suffix = Date.now().toString(36);
  const nickname = `api_${suffix}`.slice(0, 24);
  const trackSlug = `api-track-${suffix}`;

  const authorized = () => ({ Authorization: `Bearer ${accessToken}` });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    prisma = app.get(PrismaService);
    agent = request.agent(app.getHttpServer());

    const lastTrack = await prisma.track.findFirst({
      orderBy: { order: 'desc' },
      select: { order: true },
    });
    const track = await prisma.track.create({
      data: {
        slug: trackSlug,
        order: (lastTrack?.order ?? 0) + 1000,
        name: 'API test track',
        description: 'Created and removed by the e2e suite',
        difficulty: TrackDifficulty.EASY,
        points: 25,
      },
      select: { id: true },
    });
    trackId = track.id;
  });

  it('GET /api/health', async () => {
    await agent.get('/api/health').expect(200, { status: 'ok' });
  });

  it('POST /api/auth/login and validates input', async () => {
    await agent
      .post('/api/auth/login')
      .send({ nickname: '<script>', gender: Gender.MALE })
      .expect(400);

    const response = await agent
      .post('/api/auth/login')
      .send({ nickname, gender: Gender.FEMALE })
      .expect(200);
    const body = bodyOf<LoginBody>(response);
    expect(body.accessToken).toEqual(expect.any(String));
    expect(body.user.nickname).toBe(nickname);
    accessToken = body.accessToken;
    userId = body.user.id;
  });

  it('GET /api/auth/me', async () => {
    const response = await agent
      .get('/api/auth/me')
      .set(authorized())
      .expect(200);
    expect(bodyOf<Record<string, unknown>>(response)).toMatchObject({
      id: userId,
      nickname,
      points: 0,
    });
  });

  it('GET /api/profile and GET /api/profile/avatar', async () => {
    const response = await agent
      .get('/api/profile')
      .set(authorized())
      .expect(200);
    expect(bodyOf<Record<string, unknown>>(response)).toMatchObject({
      completedTracks: 0,
      hasAvatar: false,
      nickname,
    });

    await agent.get('/api/profile/avatar').set(authorized()).expect(404);
  });

  it('PUT /api/profile/avatar validates and serves image bytes safely', async () => {
    await agent
      .put('/api/profile/avatar')
      .set(authorized())
      .attach('avatar', Buffer.from('<script>alert(1)</script>'), {
        filename: 'avatar.png',
        contentType: 'image/png',
      })
      .expect(415);

    const onePixelPng = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
      'base64',
    );
    await agent
      .put('/api/profile/avatar')
      .set(authorized())
      .attach('avatar', onePixelPng, {
        filename: '../../avatar.html',
        contentType: 'text/html',
      })
      .expect(200);

    const profileResponse = await agent
      .get('/api/profile')
      .set(authorized())
      .expect(200);
    expect(bodyOf<{ hasAvatar: boolean }>(profileResponse).hasAvatar).toBe(
      true,
    );

    await agent
      .get('/api/profile/avatar')
      .set(authorized())
      .expect('Content-Type', /image\/png/)
      .expect('X-Content-Type-Options', 'nosniff')
      .expect(200);
  });

  it('GET /api/tracks', async () => {
    const response = await agent
      .get('/api/tracks')
      .set(authorized())
      .expect(200);
    expect(bodyOf<Array<Record<string, unknown>>>(response)).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: trackId })]),
    );
  });

  it('POST /api/tracks/:trackId/completions', async () => {
    const response = await agent
      .post(`/api/tracks/${trackId}/completions`)
      .set(authorized())
      .send({ result: 'FIRST_TRY' })
      .expect(201);
    expect(bodyOf<Record<string, unknown>>(response)).toMatchObject({
      awardedPoints: 25,
      totalPoints: 25,
    });

    await agent
      .post(`/api/tracks/${trackId}/completions`)
      .set(authorized())
      .send({ result: 'FIRST_TRY' })
      .expect(409);
  });

  it('PUT /api/tracks/:trackId/rating', async () => {
    await agent
      .put(`/api/tracks/${trackId}/rating`)
      .set(authorized())
      .send({ value: 6 })
      .expect(400);
    const response = await agent
      .put(`/api/tracks/${trackId}/rating`)
      .set(authorized())
      .send({ value: 5 })
      .expect(200);
    expect(bodyOf<Record<string, unknown>>(response)).toMatchObject({
      trackId,
      value: 5,
    });
  });

  it('GET /api/leagues/current and POST /api/leagues/recalculate', async () => {
    const leaderboard = await agent
      .get('/api/leagues/current')
      .set(authorized())
      .expect(200);
    expect(bodyOf<LeaderboardBody>(leaderboard).entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: userId, isCurrent: true }),
      ]),
    );

    await agent.post('/api/leagues/recalculate').set(authorized()).expect(201);
  });

  it('POST /api/auth/refresh enforces CSRF header', async () => {
    await agent.post('/api/auth/refresh').expect(403);
    const response = await agent
      .post('/api/auth/refresh')
      .set('X-Requested-With', 'XMLHttpRequest')
      .expect(200);
    const body = bodyOf<{ accessToken: string }>(response);
    expect(body.accessToken).toEqual(expect.any(String));
    accessToken = body.accessToken;
  });

  it('POST /api/auth/logout revokes refresh session', async () => {
    await agent
      .post('/api/auth/logout')
      .set(authorized())
      .expect(200, { message: 'Успешный выход' });
    await agent
      .post('/api/auth/refresh')
      .set('X-Requested-With', 'XMLHttpRequest')
      .expect(401);
  });

  afterAll(async () => {
    if (prisma) {
      if (userId) await prisma.user.deleteMany({ where: { id: userId } });
      if (trackId) await prisma.track.deleteMany({ where: { id: trackId } });
    }
    if (app) await app.close();
  });
});
