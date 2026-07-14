import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

type RequestWithUser = Request & { user?: Record<string, unknown> };

export const GetUser = createParamDecorator(
  (property: string | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    return property ? request.user?.[property] : request.user;
  },
);
