import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { Gender, League } from '../generated/prisma/client';

type LeaderboardEntry = {
  id: string;
  nickname: string;
  gender: Gender;
  points: number;
};

const leagueTitles: Record<League, string> = {
  [League.GREEN]: 'Зелёная лига',
  [League.BLUE]: 'Синяя лига',
};

@Injectable()
export class LeaderboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrentLeaderboard(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, league: true },
    });
    if (!user) throw new UnauthorizedException('User does not exist');

    const entries = await this.getLeagueEntries(user.league);
    const currentUserIndex = entries.findIndex((entry) => entry.id === user.id);
    const rankedEntries = entries.map((entry, index) => ({
      ...entry,
      rank: index + 1,
      isTopThree: index < 3,
      isCurrent: entry.id === user.id,
    }));

    return {
      league: user.league,
      title: leagueTitles[user.league],
      promotionPlaces: 3,
      entries: rankedEntries,
      currentUser: rankedEntries[currentUserIndex],
    };
  }

  getLeagueEntries(league: League): Promise<LeaderboardEntry[]> {
    return this.prisma.user.findMany({
      where: { league },
      orderBy: [{ points: 'desc' }, { createdAt: 'asc' }, { id: 'asc' }],
      select: { id: true, nickname: true, gender: true, points: true },
    });
  }
}
