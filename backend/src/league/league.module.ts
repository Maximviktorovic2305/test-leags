import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { LeaderboardService } from './leaderboard.service';
import { LeagueController } from './league.controller';
import { LeagueService } from './league.service';

@Module({
  imports: [AuthModule],
  controllers: [LeagueController],
  providers: [LeaderboardService, LeagueService],
})
export class LeagueModule {}
