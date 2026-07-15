import { ForbiddenException, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { CsrfHeaderGuard } from './csrf-header.guard';

describe('CsrfHeaderGuard', () => {
  const guard = new CsrfHeaderGuard();

  function contextWithHeader(value?: string): ExecutionContext {
    const request = {
      get: jest.fn().mockReturnValue(value),
    } as unknown as Request;
    return {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
  }

  it('accepts the expected custom request header', () => {
    expect(guard.canActivate(contextWithHeader('XMLHttpRequest'))).toBe(true);
  });

  it('rejects requests without the CSRF header', () => {
    expect(() => guard.canActivate(contextWithHeader())).toThrow(
      ForbiddenException,
    );
  });
});
