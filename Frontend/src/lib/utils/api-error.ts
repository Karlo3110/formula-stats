import { ApiError } from '@/types/api.types';

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  return fallback;
}

export function getApiErrorCode(error: unknown): string | null {
  return error instanceof ApiError ? error.code : null;
}
