export const VERIFICATION_CODE_LENGTH = 6;
export const RESET_TOKEN_BYTES = 32;

export const verificationCacheKey = (userId: string): string =>
  `auth:verify:${userId}`;

export const resetTokenCacheKey = (token: string): string =>
  `auth:reset:${token}`;
