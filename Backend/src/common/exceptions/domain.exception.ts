/**
 * Base class for typed domain errors. Each carries a stable machine-readable
 * `code` and an HTTP `statusCode`, mapped to the wire by the global filter
 * (.claude/rules/08-error-handling.md).
 */
export class DomainException extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 400,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class InvalidCredentialsException extends DomainException {
  constructor() {
    super('Email or password is incorrect.', 'INVALID_CREDENTIALS', 401);
  }
}

export class EmailAlreadyRegisteredException extends DomainException {
  constructor() {
    super('Email is already registered.', 'EMAIL_ALREADY_REGISTERED', 409);
  }
}

export class UserNotFoundException extends DomainException {
  constructor() {
    super('User not found.', 'USER_NOT_FOUND', 404);
  }
}

export class AccountNotActiveException extends DomainException {
  constructor() {
    super(
      'Account is not active. Verify your email to continue.',
      'ACCOUNT_NOT_ACTIVE',
      403,
    );
  }
}

export class InvalidVerificationCodeException extends DomainException {
  constructor() {
    super(
      'Verification code is invalid or has expired.',
      'INVALID_VERIFICATION_CODE',
      400,
    );
  }
}

export class InvalidResetTokenException extends DomainException {
  constructor() {
    super(
      'Password reset token is invalid or has expired.',
      'INVALID_RESET_TOKEN',
      400,
    );
  }
}

export class InvalidRefreshTokenException extends DomainException {
  constructor() {
    super('Refresh token is invalid or has expired.', 'INVALID_REFRESH_TOKEN', 401);
  }
}

export class DataServiceUnavailableException extends DomainException {
  constructor(message = 'The F1 data service is unavailable.') {
    super(message, 'DATA_SERVICE_UNAVAILABLE', 502);
  }
}

export class F1DataNotFoundException extends DomainException {
  constructor() {
    super(
      'F1 data for the requested session is not available yet.',
      'F1_DATA_NOT_FOUND',
      404,
    );
  }
}
