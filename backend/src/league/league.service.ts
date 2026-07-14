import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { League } from '../generated/prisma/client';

const nextLeague: Partial<Record<League, League>> = {
  [League.GREEN]: League.BLUE,
};

@Injectable()
export class LeagueService {
  constructor(private readonly prisma: PrismaService) {}

  async recalculate() {
    return this.prisma.$transaction(
      async (transaction) => {
        const rankings = await Promise.all(
          Object.values(League).map(async (league) => ({
            league,
            users: await transaction.user.findMany({
              where: { league },
              orderBy: [
                { points: 'desc' },
                { createdAt: 'asc' },
                { id: 'asc' },
              ],
              select: { id: true, nickname: true, points: true },
            }),
          })),
        );

        const promoted: Array<{
          userId: string;
          nickname: string;
          fromLeague: League;
          toLeague: League;
          rank: number;
        }> = [];

        for (const ranking of rankings) {
          const destination = nextLeague[ranking.league];
          if (!destination) continue;

          for (const [index, user] of ranking.users.slice(0, 3).entries()) {
            const rank = index + 1;
            await transaction.user.update({
              where: { id: user.id },
              data: { league: destination },
            });
            await transaction.leagueChange.create({
              data: {
                userId: user.id,
                fromLeague: ranking.league,
                toLeague: destination,
                rank,
              },
            });
            promoted.push({
              userId: user.id,
              nickname: user.nickname,
              fromLeague: ranking.league,
              toLeague: destination,
              rank,
            });
          }
        }

        return {
          recalculatedAt: new Date(),
          topThree: rankings.map((ranking) => ({
            league: ranking.league,
            users: ranking.users.slice(0, 3).map((user, index) => ({
              rank: index + 1,
              ...user,
            })),
          })),
          promoted,
        };
      },
      { isolationLevel: 'Serializable' },
    );
  }
}
