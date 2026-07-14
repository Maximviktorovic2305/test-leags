import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './common/database/database.module';
import { validateEnvironment } from './common/config/validate-environment';
import { ErrorHandlingModule } from './common/errors/error-handling.module';
import { RateLimitModule } from './common/rate-limit/rate-limit.module';
import { RedisModule } from './common/redis/redis.module';
import { LeagueModule } from './league/league.module';
import { ProfileModule } from './profile/profile.module';
import { TracksModule } from './tracks/tracks.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV ?? 'development'}`, '.env'],
      validate: validateEnvironment,
    }),
    DatabaseModule,
    RedisModule,
    ErrorHandlingModule,
    RateLimitModule,
    AuthModule,
    ProfileModule,
    TracksModule,
    LeagueModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
