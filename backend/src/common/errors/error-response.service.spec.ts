import {
  BadRequestException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { ErrorResponseService } from './error-response.service';

describe('ErrorResponseService', () => {
  const service = new ErrorResponseService();

  it('preserves localized validation reasons', () => {
    const error = service.resolve(
      new BadRequestException({
        message: ['Никнейм должен содержать от 2 до 24 символов'],
      }),
    );

    expect(error).toMatchObject({
      statusCode: HttpStatus.BAD_REQUEST,
      code: 'BAD_REQUEST',
      message: ['Никнейм должен содержать от 2 до 24 символов'],
      isUnexpected: false,
    });
  });

  it('translates framework errors into a safe Russian reason', () => {
    const error = service.resolve(new NotFoundException());

    expect(error).toMatchObject({
      statusCode: HttpStatus.NOT_FOUND,
      code: 'NOT_FOUND',
      message: 'Запрошенный ресурс не найден',
      isUnexpected: false,
    });
  });

  it('does not expose details of an unexpected error', () => {
    const error = service.resolve(new Error('database credentials leaked'));

    expect(error).toMatchObject({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Внутренняя ошибка сервера',
      isUnexpected: true,
    });
  });
});
