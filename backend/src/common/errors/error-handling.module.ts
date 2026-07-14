import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ApiExceptionFilter } from './api-exception.filter';
import { ErrorResponseService } from './error-response.service';

@Module({
  providers: [
    ErrorResponseService,
    {
      provide: APP_FILTER,
      useClass: ApiExceptionFilter,
    },
  ],
})
export class ErrorHandlingModule {}
