import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';

const CSRF_HEADER_NAME = 'x-requested-with';
const CSRF_HEADER_VALUE = 'XMLHttpRequest';

@Injectable()
export class CsrfHeaderGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    if (request.get(CSRF_HEADER_NAME) !== CSRF_HEADER_VALUE) {
      throw new ForbiddenException('Запрос отклонён проверкой безопасности');
    }
    return true;
  }
}
