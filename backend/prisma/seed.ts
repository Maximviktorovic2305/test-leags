import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  Gender,
  League,
  PrismaClient,
  TrackDifficulty,
} from '../src/generated/prisma/client';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to seed the database');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

const tracks = [
  {
    slug: 'warm-up',
    order: 1,
    name: 'Разминка',
    description: 'Короткая техничная трасса для уверенного старта.',
    difficulty: TrackDifficulty.EASY,
    points: 50,
  },
  {
    slug: 'green-wave',
    order: 2,
    name: 'Зелёная волна',
    description: 'Плавные перехваты и один динамичный финишный ход.',
    difficulty: TrackDifficulty.EASY,
    points: 70,
  },
  {
    slug: 'balance-point',
    order: 3,
    name: 'Точка баланса',
    description: 'Маршрут на постановку ног и контроль центра тяжести.',
    difficulty: TrackDifficulty.MEDIUM,
    points: 90,
  },
  {
    slug: 'blue-crack',
    order: 4,
    name: 'Синий разлом',
    description: 'Силовая середина и точная работа на небольших зацепах.',
    difficulty: TrackDifficulty.MEDIUM,
    points: 110,
  },
  {
    slug: 'vertical-limit',
    order: 5,
    name: 'Вертикальный предел',
    description: 'Длинная выносливая линия с несколькими вариантами решения.',
    difficulty: TrackDifficulty.HARD,
    points: 135,
  },
  {
    slug: 'top-three',
    order: 6,
    name: 'Рывок в топ‑3',
    description:
      'Главный вызов сезона: сложная последовательность до самого топа.',
    difficulty: TrackDifficulty.HARD,
    points: 160,
  },
] as const;

const users = [
  { nickname: 'Лис', gender: Gender.MALE, league: League.GREEN, points: 280 },
  {
    nickname: 'Мята',
    gender: Gender.FEMALE,
    league: League.GREEN,
    points: 220,
  },
  { nickname: 'Кедр', gender: Gender.MALE, league: League.GREEN, points: 140 },
  {
    nickname: 'Искра',
    gender: Gender.FEMALE,
    league: League.GREEN,
    points: 90,
  },
  { nickname: 'Мох', gender: Gender.MALE, league: League.GREEN, points: 45 },
  { nickname: 'Шторм', gender: Gender.MALE, league: League.BLUE, points: 620 },
  { nickname: 'Луна', gender: Gender.FEMALE, league: League.BLUE, points: 510 },
  {
    nickname: 'Волна',
    gender: Gender.FEMALE,
    league: League.BLUE,
    points: 470,
  },
  { nickname: 'Гранит', gender: Gender.MALE, league: League.BLUE, points: 410 },
  {
    nickname: 'Комета',
    gender: Gender.FEMALE,
    league: League.BLUE,
    points: 360,
  },
] as const;

async function main() {
  await prisma.$transaction(
    tracks.map((track) =>
      prisma.track.upsert({
        where: { slug: track.slug },
        create: track,
        update: track,
      }),
    ),
  );

  await prisma.$transaction(
    users.map((user) =>
      prisma.user.upsert({
        where: { nickname: user.nickname },
        create: user,
        update: {},
      }),
    ),
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
