export type ErrorMessage = string | string[];

export type ResolvedApiError = {
  statusCode: number;
  code: string;
  message: ErrorMessage;
  isUnexpected: boolean;
};

export type ApiErrorResponse = Omit<ResolvedApiError, 'isUnexpected'> & {
  timestamp: string;
  path: string;
};
