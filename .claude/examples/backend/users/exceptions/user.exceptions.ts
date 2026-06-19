/**
 * Typed domain exceptions for the Users feature. Each carries a stable machine-readable
 * code and an HTTP status. The global DomainExceptionFilter maps these to responses.
 * See rules/08-error-handling.md.
 */

export class DomainException extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 400,
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = new.target.name;
  }
}

export class UserNotFoundException extends DomainException {
  constructor(userId: string) {
    super(`User with ID ${userId} not found`, 'USER_NOT_FOUND', 404);
  }
}

export class EmailAlreadyInUseException extends DomainException {
  constructor(email: string) {
    super(`Email ${email} is already in use`, 'EMAIL_ALREADY_IN_USE', 409);
  }
}

export class UserNotActiveException extends DomainException {
  constructor(userId: string) {
    super(`User ${userId} is not active`, 'USER_NOT_ACTIVE', 403);
  }
}
