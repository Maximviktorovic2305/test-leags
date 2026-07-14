import { IsEnum } from 'class-validator';
import { CompletionResult } from '../../generated/prisma/client';

export class CompleteTrackDto {
  @IsEnum(CompletionResult)
  result!: CompletionResult;
}
