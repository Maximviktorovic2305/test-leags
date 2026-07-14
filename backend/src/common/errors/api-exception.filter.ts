import {
  ArgumentsHost,
  Catch,
  type ExceptionFilter,
  Injectable,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ErrorResponseService } from './error-response.service';
import type { ApiErrorResponse } from './error-response.types';

@Catch()
@Injectable()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  constructor(private readonly errorResponseService: ErrorResponseService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();
    const resolvedError = this.errorResponseService.resolve(exception);

    if (resolvedError.isUnexpected) {
      const stack = exception instanceof Error ? exception.stack : undefined;
      this.logger.error(
        `${request.method} ${request.originalUrl} завершился ошибкой`,
        stack,
      );
    }

    const payload: ApiErrorResponse = {
      statusCode: resolvedError.statusCode,
      code: resolvedError.code,
      message: resolvedError.message,
      timestamp: new Date().toISOString(),
      path: request.originalUrl,
    };
    response.status(resolvedError.statusCode).json(payload);
  }
}
