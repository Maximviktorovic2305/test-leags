import { IsInt, Max, Min } from 'class-validator';

export class RateTrackDto {
  @IsInt({ message: 'Оценка должна быть целым числом' })
  @Min(1, { message: 'Минимальная оценка — 1' })
  @Max(5, { message: 'Максимальная оценка — 5' })
  value!: number;
}
