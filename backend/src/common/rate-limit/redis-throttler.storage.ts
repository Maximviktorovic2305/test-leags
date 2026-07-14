import type { ThrottlerStorage } from '@nestjs/throttler';
import { RedisService } from '../redis/redis.service';

const incrementScript = `
local blockedTtl = redis.call('PTTL', KEYS[2])
if blockedTtl > 0 then
  local currentHits = tonumber(redis.call('GET', KEYS[1]) or ARGV[2])
  local hitsTtl = math.max(redis.call('PTTL', KEYS[1]), 0)
  return { currentHits, hitsTtl, 1, blockedTtl }
end

local totalHits = redis.call('INCR', KEYS[1])
if totalHits == 1 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
end

local hitsTtl = math.max(redis.call('PTTL', KEYS[1]), 0)
if totalHits > tonumber(ARGV[2]) then
  redis.call('SET', KEYS[2], '1', 'PX', ARGV[3])
  return { totalHits, hitsTtl, 1, tonumber(ARGV[3]) }
end

return { totalHits, hitsTtl, 0, 0 }
`;

export class RedisThrottlerStorage implements ThrottlerStorage {
  constructor(private readonly redis: RedisService) {}

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ) {
    const client = await this.redis.getConnectedClient();
    const keyPrefix = `rate-limit:{${key}}:${throttlerName}`;
    const result = await client.eval(incrementScript, {
      keys: [`${keyPrefix}:hits`, `${keyPrefix}:blocked`],
      arguments: [String(ttl), String(limit), String(blockDuration)],
    });

    if (!Array.isArray(result) || result.length !== 4) {
      throw new Error('Redis returned an invalid rate-limit result');
    }

    const [totalHits, timeToExpireMs, isBlocked, timeToBlockExpireMs] =
      result.map(Number);

    return {
      totalHits,
      timeToExpire: this.toSeconds(timeToExpireMs),
      isBlocked: isBlocked === 1,
      timeToBlockExpire: this.toSeconds(timeToBlockExpireMs),
    };
  }

  private toSeconds(milliseconds: number): number {
    return Math.max(0, Math.ceil(milliseconds / 1000));
  }
}
