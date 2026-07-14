import { Transform } from 'class-transformer';
import { IsEnum, IsString, Length, Matches } from 'class-validator';
import { Gender } from '../../generated/prisma/client';

export class LoginDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'Никнейм должен быть строкой' })
  @Length(2, 24, {
    message: 'Никнейм должен содержать от 2 до 24 символов',
  })
  @Matches(/^[\p{L}\p{N}_-]+$/u, {
    message: 'Никнейм может содержать только буквы, цифры, _ и -',
  })
  nickname!: string;

  @IsEnum(Gender, { message: 'Выберите пол: мужчина или женщина' })
  gender!: Gender;
}
