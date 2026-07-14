import { randomUUID } from 'node:crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/database/prisma.service';
import { League } from '../generated/prisma/client';
import { getAuthTokenSettings } from './auth-token-config';
import { LoginDto } from './dto/login.dto';
import { RefreshSessionStore, type TokenPair } from './refresh-session.store';

const publicUserSelect = {
  id: true,
  nickname: true,
  gender: true,
  league: true,
  points: true,
} as const;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly refreshSessions: RefreshSessionStore,
  ) {}

  async login(dto: LoginDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: { nickname: { equals: dto.nickname, mode: 'insensitive' } },
      select: publicUserSelect,
    });

    const user =
      existingUser ??
      (await this.prisma.user.create({
        data: {
          nickname: dto.nickname,
          gender: dto.gender,
          league: League.GREEN,
        },
        select: publicUserSelect,
      }));
    const tokens = await this.createTokens(user.id, user.nickname);
    await this.refreshSessions.setCurrentToken(user.id, tokens.refreshToken);

    return { user, ...tokens };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: publicUserSelect,
    });

    if (!user) throw new UnauthorizedException('Пользователь не найден');
    return user;
  }

  async logout(userId: string): Promise<void> {
    await this.refreshSessions.revokeCurrentToken(userId);
  }

  async refreshTokens(
    userId: string,
    refreshToken: string,
  ): Promise<TokenPair> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, nickname: true },
    });
    if (!user) throw new UnauthorizedException('Пользователь не найден');

    const newTokens = await this.createTokens(user.id, user.nickname);
    const result = await this.refreshSessions.rotateOrReplay(
      user.id,
      refreshToken,
      newTokens,
    );
    if (result.status === 'INVALID') {
      throw new UnauthorizedException('Невалидный или истекший refresh-токен');
    }

    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
  }

  private async createTokens(
    userId: string,
    nickname: string,
  ): Promise<TokenPair> {
    const settings = getAuthTokenSettings(this.config);
    const payload = { sub: userId, nickname };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(
        { ...payload, jti: randomUUID() },
        {
          secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
          expiresIn: settings.accessTokenTtlSeconds,
        },
      ),
      this.jwt.signAsync(
        { ...payload, jti: randomUUID() },
        {
          secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
          expiresIn: settings.refreshTokenTtlSeconds,
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }
}
