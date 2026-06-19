/** Standard error shape returned by the backend (.claude/rules/backend/api-contract.md). */
export interface ApiErrorBody {
  title: string;
  status: number;
  detail: string;
  code: string;
  errors?: Record<string, string[]>;
  traceId: string;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
