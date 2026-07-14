import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { CompleteTrackDto } from './dto/complete-track.dto';
import { RateTrackDto } from './dto/rate-track.dto';
import { PointsCalculatorService } from './points-calculator.service';

@Injectable()
export class TracksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pointsCalculator: PointsCalculatorService,
  ) {}

  async getTracks(userId: string) {
    await this.ensureUserExists(userId);
    const tracks = await this.prisma.track.findMany({
      orderBy: { order: 'asc' },
      include: {
        completions: {
          where: { userId },
          select: {
            result: true,
            awardedPoints: true,
            completedAt: true,
          },
        },
        ratings: {
          where: { userId },
          select: { value: true },
        },
      },
    });

    return tracks.map(({ completions, ratings, ...track }) => ({
      ...track,
      completion: completions[0] ?? null,
      userRating: ratings[0]?.value ?? null,
    }));
  }

  async completeTrack(userId: string, trackId: string, dto: CompleteTrackDto) {
    const result = await this.prisma.$transaction(
      async (transaction) => {
        const [user, track, existingCompletion] = await Promise.all([
          transaction.user.findUnique({
            where: { id: userId },
            select: { id: true, league: true },
          }),
          transaction.track.findUnique({ where: { id: trackId } }),
          transaction.trackCompletion.findUnique({
            where: { userId_trackId: { userId, trackId } },
          }),
        ]);

        if (!user) throw new UnauthorizedException('Пользователь не найден');
        if (!track) throw new NotFoundException('Трасса не найдена');
        if (existingCompletion) {
          throw new ConflictException('Эта трасса уже была пройдена');
        }

        const awardedPoints = this.pointsCalculator.calculate(
          track.points,
          dto.result,
        );
        const [completion, updatedUser] = await Promise.all([
          transaction.trackCompletion.create({
            data: { userId, trackId, result: dto.result, awardedPoints },
            select: {
              trackId: true,
              result: true,
              awardedPoints: true,
              completedAt: true,
            },
          }),
          transaction.user.update({
            where: { id: userId },
            data: { points: { increment: awardedPoints } },
            select: { points: true, league: true },
          }),
        ]);

        return {
          ...completion,
          totalPoints: updatedUser.points,
          league: updatedUser.league,
        };
      },
      { isolationLevel: 'Serializable' },
    );

    return result;
  }

  async rateTrack(userId: string, trackId: string, dto: RateTrackDto) {
    const completion = await this.prisma.trackCompletion.findUnique({
      where: { userId_trackId: { userId, trackId } },
      select: { id: true },
    });

    if (!completion) {
      throw new BadRequestException(
        'Сначала пройдите трассу, затем поставьте оценку',
      );
    }

    return this.prisma.trackRating.upsert({
      where: { userId_trackId: { userId, trackId } },
      create: { userId, trackId, value: dto.value },
      update: { value: dto.value },
      select: { trackId: true, value: true, updatedAt: true },
    });
  }

  private async ensureUserExists(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!user) throw new UnauthorizedException('Пользователь не найден');
  }
}
