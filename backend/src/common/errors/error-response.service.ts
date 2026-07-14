import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';
import type { ErrorMessage, ResolvedApiError } from './error-response.types';

const internalServerErrorMessage = 'Внутренняя ошибка сервера';

const statusMessages: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: 'Некорректные данные запроса',
  [HttpStatus.UNAUTHORIZED]: 'Требуется авторизация',
  [HttpStatus.FORBIDDEN]: 'Недостаточно прав для выполнения действия',
  [HttpStatus.NOT_FOUND]: 'Запрошенный ресурс не найден',
  [HttpStatus.CONFLICT]: 'Конфликт с уже сохранёнными данными',
  [HttpStatus.UNPROCESSABLE_ENTITY]: 'Не удалось обработать данные запроса',
  [HttpStatus.TOO_MANY_REQUESTS]:
    'Слишком много запросов. Повторите попытку позже',
  [HttpStatus.INTERNAL_SERVER_ERROR]: internalServerErrorMessage,
  [HttpStatus.BAD_GATEWAY]: 'Внешний сервис временно недоступен',
  [HttpStatus.SERVICE_UNAVAILABLE]: 'Сервис временно недоступен',
  [HttpStatus.GATEWAY_TIMEOUT]: 'Сервис не ответил вовремя',
};

const statusCodes: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
  [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
  [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
  [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
  [HttpStatus.CONFLICT]: 'CONFLICT',
  [HttpStatus.UNPROCESSABLE_ENTITY]: 'UNPROCESSABLE_ENTITY',
  [HttpStatus.TOO_MANY_REQUESTS]: 'RATE_LIMIT_EXCEEDED',
  [HttpStatus.INTERNAL_SERVER_ERROR]: 'INTERNAL_SERVER_ERROR',
};

const prismaErrors: Partial<
  Record<string, Pick<ResolvedApiError, 'statusCode' | 'code' | 'message'>>
> = {
  P2002: {
    statusCode: HttpStatus.CONFLICT,
    code: 'UNIQUE_CONSTRAINT_VIOLATION',
    message: 'Запись с такими данными уже существует',
  },
  P2003: {
    statusCode: HttpStatus.CONFLICT,
    code: 'RELATED_RECORD_CONFLICT',
    message: 'Операция конфликтует со связанными данными',
  },
  P2025: {
    statusCode: HttpStatus.NOT_FOUND,
    code: 'RECORD_NOT_FOUND',
    message: 'Запрашиваемая запись не найдена',
  },
};

@Injectable()
export class ErrorResponseService {
  resolve(exception: unknown): ResolvedApiError {
    if (this.isPrismaKnownRequestError(exception)) {
      const mappedError = prismaErrors[exception.code];
      if (mappedError) return { ...mappedError, isUnexpected: false };
    }

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      return {
        statusCode,
        code: statusCodes[statusCode] ?? `HTTP_${statusCode}`,
        message: this.resolveHttpMessage(exception, statusCode),
        isUnexpected: statusCode >= 500,
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_SERVER_ERROR',
      message: internalServerErrorMessage,
      isUnexpected: true,
    };
  }

  private resolveHttpMessage(
    exception: HttpException,
    statusCode: number,
  ): ErrorMessage {
    const response = exception.getResponse();
    const rawMessage =
      typeof response === 'string'
        ? response
        : this.isObjectWithMessage(response)
          ? response.message
          : undefined;

    if (Array.isArray(rawMessage)) {
      return rawMessage.map((message) =>
        this.translateMessage(message, statusCode),
      );
    }
    return this.translateMessage(rawMessage, statusCode);
  }

  private translateMessage(message: unknown, statusCode: number): string {
    if (typeof message === 'string' && /[А-яЁё]/u.test(message)) {
      return message;
    }

    if (typeof message === 'string') {
      const unknownProperty = /^property (.+) should not exist$/i.exec(message);
      if (unknownProperty?.[1]) {
        return `Поле «${unknownProperty[1]}» не поддерживается`;
      }
    }

    return statusMessages[statusCode] ?? internalServerErrorMessage;
  }

  private isObjectWithMessage(
    value: unknown,
  ): value is { message?: string | string[] } {
    return typeof value === 'object' && value !== null && 'message' in value;
  }

  private isPrismaKnownRequestError(
    exception: unknown,
  ): exception is Prisma.PrismaClientKnownRequestError {
    return (
      exception instanceof Error &&
      'code' in exception &&
      typeof exception.code === 'string' &&
      /^P\d{4}$/u.test(exception.code)
    );
  }
}
