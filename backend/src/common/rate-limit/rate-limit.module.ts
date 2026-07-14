import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { RedisModule } from '../redis/redis.module';
import { RedisService } from '../redis/redis.service';
import { RedisThrottlerStorage } from './redis-throttler.storage';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule, RedisModule],
      inject: [ConfigService, RedisService],
      useFactory: (config: ConfigService, redis: RedisService) => ({
        throttlers: [
          {
            name: 'default',
            ttl: Number(config.getOrThrow<string>('RATE_LIMIT_TTL_MS')),
            limit: Number(config.getOrThrow<string>('RATE_LIMIT_MAX')),
            blockDuration: Number(
              config.getOrThrow<string>('RATE_LIMIT_BLOCK_MS'),
            ),
          },
        ],
        storage: new RedisThrottlerStorage(redis),
        errorMessage: 'Слишком много запросов. Повторите попытку позже',
      }),
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class RateLimitModule {}
