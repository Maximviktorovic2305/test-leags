import { ConfigService } from '@nestjs/config';

const EXPIRATION_PATTERN = /^(\d+)([smhd])?$/;

type TokenSettings = {
  accessTokenTtlSeconds: number;
  refreshTokenTtlMs: number;
  refreshTokenTtlSeconds: number;
  refreshTokenIdempotencyWindowMs: number;
};

export function getAuthTokenSettings(
  config: Pick<ConfigService, 'get'>,
): TokenSettings {
  const accessTokenTtlSeconds = parseExpiration(
    config.get<string>('JWT_ACCESS_EXPIRATION', '15m'),
    'JWT_ACCESS_EXPIRATION',
  );
  const refreshTokenTtlSeconds = parseExpiration(
    config.get<string>('JWT_REFRESH_EXPIRATION', '7d'),
    'JWT_REFRESH_EXPIRATION',
  );
  const refreshTokenIdempotencyWindowMs = Number(
    config.get<string>('JWT_REFRESH_IDEMPOTENCY_WINDOW_MS', '30000'),
  );

  if (
    !Number.isSafeInteger(refreshTokenIdempotencyWindowMs) ||
    refreshTokenIdempotencyWindowMs <= 0
  ) {
    throw new Error(
      'JWT_REFRESH_IDEMPOTENCY_WINDOW_MS must be a positive integer',
    );
  }

  return {
    accessTokenTtlSeconds,
    refreshTokenTtlMs: refreshTokenTtlSeconds * 1000,
    refreshTokenTtlSeconds,
    refreshTokenIdempotencyWindowMs,
  };
}

function parseExpiration(value: string | undefined, name: string): number {
  const normalized = String(value ?? '').trim();
  const match = EXPIRATION_PATTERN.exec(normalized);
  if (!match) {
    throw new Error(`${name} must be seconds or a duration like 15m, 2h or 7d`);
  }

  const amount = Number(match[1]);
  const unit = match[2] ?? 's';
  const multiplier = { s: 1, m: 60, h: 3600, d: 86400 }[unit] ?? 1;
  const seconds = amount * multiplier;

  if (!Number.isSafeInteger(seconds) || seconds <= 0) {
    throw new Error(`${name} must be a positive duration`);
  }

  return seconds;
}
