/**
 * In-memory holder for the access token. Kept out of localStorage so it is not
 * readable by injected scripts; the refresh token lives in an httpOnly cookie
 * (.claude/rules/frontend/routing-layouts-guards.md).
 */
let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}
