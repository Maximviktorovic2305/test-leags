import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { REFRESH_TOKEN_COOKIE_NAME } from '../auth-cookie.constants';

type JwtPayload = { sub: string; nickname: string };

function extractRefreshToken(request: Request): string | null {
  const cookieRequest = request as unknown as {
    cookies?: Record<string, unknown>;
  };
  const token = cookieRequest.cookies?.[REFRESH_TOKEN_COOKIE_NAME];
  return typeof token === 'string' ? token : null;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: extractRefreshToken,
      ignoreExpiration: false,
      passReqToCallback: true,
      secretOrKey: config.getOrThrow<string>('JWT_REFRESH_SECRET'),
    });
  }

  validate(request: Request, payload: JwtPayload) {
    const refreshToken = extractRefreshToken(request);
    if (!payload.sub || !refreshToken) {
      throw new UnauthorizedException('Невалидный refresh-токен');
    }

    return { id: payload.sub, refreshToken };
  }
}
