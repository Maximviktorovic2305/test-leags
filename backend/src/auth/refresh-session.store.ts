import { createHash } from 'node:crypto';
import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService, type RedisClient } from '../common/redis/redis.service';
import { getAuthTokenSettings } from './auth-token-config';

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

type RotateResult =
  { status: 'INVALID' } | ({ status: 'REPLAY' | 'ROTATED' } & TokenPair);

const ROTATE_OR_REPLAY_SCRIPT = `
local currentKey = KEYS[1]
local replayKey = KEYS[2]
local oldRefreshToken = ARGV[1]
local newAccessToken = ARGV[2]
local newRefreshToken = ARGV[3]
local currentTtlMs = tonumber(ARGV[4])
local replayTtlMs = tonumber(ARGV[5])
local currentRefreshToken = redis.call('GET', currentKey)
local replayRaw = redis.call('GET', replayKey)

if replayRaw then
  local ok, replay = pcall(cjson.decode, replayRaw)
  if ok and replay and replay["refreshToken"] and currentRefreshToken and replay["refreshToken"] == currentRefreshToken then
    return cjson.encode({ status = "REPLAY", accessToken = replay["accessToken"], refreshToken = replay["refreshToken"] })
  end
end

if not currentRefreshToken or currentRefreshToken ~= oldRefreshToken then
  return cjson.encode({ status = "INVALID" })
end

local replayPayload = cjson.encode({ accessToken = newAccessToken, refreshToken = newRefreshToken })
redis.call('SET', currentKey, newRefreshToken, 'PX', currentTtlMs)
redis.call('SET', replayKey, replayPayload, 'PX', replayTtlMs)
return cjson.encode({ status = "ROTATED", accessToken = newAccessToken, refreshToken = newRefreshToken })
`;

@Injectable()
export class RefreshSessionStore {
  private readonly logger = new Logger(RefreshSessionStore.name);
  private readonly refreshTokenTtlMs: number;
  private readonly idempotencyWindowMs: number;

  constructor(
    private readonly config: ConfigService,
    private readonly redis: RedisService,
  ) {
    const settings = getAuthTokenSettings(config);
    this.refreshTokenTtlMs = settings.refreshTokenTtlMs;
    this.idempotencyWindowMs = settings.refreshTokenIdempotencyWindowMs;
  }

  async setCurrentToken(userId: string, refreshToken: string): Promise<void> {
    await this.execute(async (client) => {
      const result = await client.set(this.currentKey(userId), refreshToken, {
        PX: this.refreshTokenTtlMs,
      });
      if (result !== 'OK')
        throw new Error(`Unexpected Redis response: ${result}`);
    });
  }

  async revokeCurrentToken(userId: string): Promise<void> {
    await this.execute(async (client) => {
      await client.del(this.currentKey(userId));
    });
  }

  async rotateOrReplay(
    userId: string,
    oldRefreshToken: string,
    newTokens: TokenPair,
  ): Promise<RotateResult> {
    const result = await this.execute((client) =>
      client.eval(ROTATE_OR_REPLAY_SCRIPT, {
        keys: [this.currentKey(userId), this.replayKey(oldRefreshToken)],
        arguments: [
          oldRefreshToken,
          newTokens.accessToken,
          newTokens.refreshToken,
          String(this.refreshTokenTtlMs),
          String(this.idempotencyWindowMs),
        ],
      }),
    );

    if (typeof result !== 'string') {
      throw new Error('Unexpected Redis refresh rotation response');
    }

    const parsed = JSON.parse(result) as Partial<RotateResult>;
    if (parsed.status === 'INVALID') return { status: 'INVALID' };
    if (
      (parsed.status === 'REPLAY' || parsed.status === 'ROTATED') &&
      typeof parsed.accessToken === 'string' &&
      typeof parsed.refreshToken === 'string'
    ) {
      return {
        status: parsed.status,
        accessToken: parsed.accessToken,
        refreshToken: parsed.refreshToken,
      };
    }

    throw new Error('Unexpected Redis refresh rotation payload');
  }

  private async execute<T>(
    operation: (client: RedisClient) => Promise<T>,
  ): Promise<T> {
    try {
      return await operation(await this.redis.getConnectedClient());
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Auth Redis operation failed: ${message}`);
      throw new ServiceUnavailableException(
        'Сервис авторизации временно недоступен',
      );
    }
  }

  private currentKey(userId: string): string {
    return `auth:refresh:current:${userId}`;
  }

  private replayKey(refreshToken: string): string {
    const hash = createHash('sha256').update(refreshToken).digest('hex');
    return `auth:refresh:replay:${hash}`;
  }
}
