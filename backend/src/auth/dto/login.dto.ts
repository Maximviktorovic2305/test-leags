import { Transform } from 'class-transformer';
import { IsEnum, IsString, Length, Matches } from 'class-validator';
import { Gender } from '../../generated/prisma/client';

export class LoginDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @Length(2, 24)
  @Matches(/^[\p{L}\p{N}_-]+$/u, {
    message: 'nickname may contain letters, numbers, _ and -',
  })
  nickname!: string;

  @IsEnum(Gender)
  gender!: Gender;
}
