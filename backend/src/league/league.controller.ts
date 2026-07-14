import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { GetUser } from '../auth/get-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LeaderboardService } from './leaderboard.service';
import { LeagueService } from './league.service';

@Controller('leagues')
@UseGuards(JwtAuthGuard)
export class LeagueController {
  constructor(
    private readonly leaderboardService: LeaderboardService,
    private readonly leagueService: LeagueService,
  ) {}

  @Get('current')
  getCurrentLeaderboard(@GetUser('id') userId: string) {
    return this.leaderboardService.getCurrentLeaderboard(userId);
  }

  @Post('recalculate')
  recalculate() {
    return this.leagueService.recalculate();
  }
}
