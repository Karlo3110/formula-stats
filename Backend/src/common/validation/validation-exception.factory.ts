import { BadRequestException } from '@nestjs/common';
import type { ValidationError } from 'class-validator';

/**
 * Turns class-validator failures into the field-level `errors` map of the
 * standard error shape (.claude/rules/backend/api-contract.md).
 */
export function validationExceptionFactory(
  errors: ValidationError[],
): BadRequestException {
  const fieldErrors: Record<string, string[]> = {};
  collect(errors, fieldErrors);
  return new BadRequestException({
    message: 'Validation failed.',
    errors: fieldErrors,
  });
}

function collect(
  errors: ValidationError[],
  acc: Record<string, string[]>,
  parentPath = '',
): void {
  for (const error of errors) {
    const path = parentPath ? `${parentPath}.${error.property}` : error.property;
    if (error.constraints) {
      acc[path] = Object.values(error.constraints);
    }
    if (error.children && error.children.length > 0) {
      collect(error.children, acc, path);
    }
  }
}
