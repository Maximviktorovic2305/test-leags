export function calculateRetryPoints(basePoints: number): number {
  return Math.round(basePoints * 0.7);
}
