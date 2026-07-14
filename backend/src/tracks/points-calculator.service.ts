import { Injectable } from '@nestjs/common';

type CompletionOutcome = 'FIRST_TRY' | 'RETRY';

@Injectable()
export class PointsCalculatorService {
  calculate(basePoints: number, result: CompletionOutcome): number {
    if (result === 'FIRST_TRY') return basePoints;
    return Math.round(basePoints * 0.7);
  }
}
