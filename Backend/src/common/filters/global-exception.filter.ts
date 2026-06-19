import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Response } from 'express';

import { DomainException } from '../exceptions/domain.exception';

interface ErrorBody {
  title: string;
  status: number;
  detail: string;
  code: string;
  errors?: Record<string, string[]>;
  traceId: string;
}

interface ValidationErrorShape {
  errors: Record<string, string[]>;
}

/**
 * Maps every thrown error to the standard error shape
 * (.claude/rules/backend/api-contract.md). Internals are never leaked to the
 * client; unexpected errors are logged and returned as a generic 500.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const traceId = randomUUID();
    const body = this.toErrorBody(exception, traceId);

    if (body.status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `[${traceId}] ${body.detail}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(body.status).json(body);
  }

  private toErrorBody(exception: unknown, traceId: string): ErrorBody {
    if (exception instanceof DomainException) {
      return {
        title: exception.code,
        status: exception.statusCode,
        detail: exception.message,
        code: exception.code,
        traceId,
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const validationErrors = extractValidationErrors(exception.getResponse());
      return {
        title: HttpStatus[status] ?? 'ERROR',
        status,
        detail: exception.message,
        code: HttpStatus[status] ?? 'ERROR',
        ...(validationErrors ? { errors: validationErrors } : {}),
        traceId,
      };
    }

    return {
      title: 'INTERNAL_ERROR',
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      detail: 'An unexpected error occurred.',
      code: 'INTERNAL_ERROR',
      traceId,
    };
  }
}

function extractValidationErrors(
  response: string | object,
): Record<string, string[]> | undefined {
  if (
    typeof response === 'object' &&
    response !== null &&
    'errors' in response &&
    isStringArrayRecord((response as ValidationErrorShape).errors)
  ) {
    return (response as ValidationErrorShape).errors;
  }
  return undefined;
}

function isStringArrayRecord(value: unknown): value is Record<string, string[]> {
  return (
    typeof value === 'object' &&
    value !== null &&
    Object.values(value).every(
      (entry) => Array.isArray(entry) && entry.every((e) => typeof e === 'string'),
    )
  );
}
