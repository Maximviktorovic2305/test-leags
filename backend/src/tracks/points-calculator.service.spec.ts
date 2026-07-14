import { PointsCalculatorService } from './points-calculator.service';

describe('PointsCalculatorService', () => {
  const service = new PointsCalculatorService();

  it('awards all base points for a first-try completion', () => {
    expect(service.calculate(160, 'FIRST_TRY')).toBe(160);
  });

  it('awards rounded 70 percent after more than one attempt', () => {
    expect(service.calculate(135, 'RETRY')).toBe(95);
  });
});
