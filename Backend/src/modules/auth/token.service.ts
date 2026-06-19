import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

import { InvalidRefreshTokenException } from '@/common/exceptions/domain.exception';
import type {
  AccessTokenPayload,
  Role,
} from '@/common/types/authenticated-user';

import { RefreshTokenRepository } from './refresh-token.repository';

interface AccessTokenSubject {
  id: string;
  email: string;
  role: Role;
}

const SECONDS_PER_DAY = 86_400;
const REFRESH_SECRET_BYTES = 32;
const TOKEN_SEPARATOR = '.';

/**
 * Issues short-lived access JWTs and opaque, rotating refresh tokens. Refresh
 * tokens are stored hashed; a reused (already-revoked) token revokes the whole
 * family (.claude/rules/database/database-standards.md auth model).
 */
@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly refreshTokens: RefreshTokenRepository,
  ) {}

  async issueAccessToken(subject: AccessTokenSubject): Promise<string> {
    const payload: AccessTokenPayload = {
      sub: subject.id,
      email: subject.email,
      role: subject.role,
    };
    return this.jwtService.signAsync(payload, {
      secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.config.getOrThrow<number>('JWT_ACCESS_TTL_SECONDS'),
    });
  }

  /** Creates a new refresh-token family entry and returns the raw token. */
  async issueRefreshToken(userId: string): Promise<string> {
    const secret = randomBytes(REFRESH_SECRET_BYTES).toString('base64url');
    const ttlDays = this.config.getOrThrow<number>('JWT_REFRESH_TTL_DAYS');
    const expiresAt = new Date(Date.now() + ttlDays * SECONDS_PER_DAY * 1000);

    const record = await this.refreshTokens.create({
      userId,
      tokenHash: hashSecret(secret),
      expiresAt,
    });
    return `${record.id}${TOKEN_SEPARATOR}${secret}`;
  }

  /** Verifies and rotates a refresh token; returns the new raw token + userId. */
  async rotateRefreshToken(
    rawToken: string,
  ): Promise<{ userId: string; refreshToken: string }> {
    const userId = await this.consume(rawToken);
    const refreshToken = await this.issueRefreshToken(userId);
    return { userId, refreshToken };
  }

  async revokeRefreshToken(rawToken: string): Promise<void> {
    const parsed = parseToken(rawToken);
    if (!parsed) {
      return;
    }
    const record = await this.refreshTokens.findById(parsed.id);
    if (record && !record.revokedAt) {
      await this.refreshTokens.revoke(record.id);
    }
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.refreshTokens.revokeAllForUser(userId);
  }

  refreshCookieMaxAgeMs(): number {
    return (
      this.config.getOrThrow<number>('JWT_REFRESH_TTL_DAYS') *
      SECONDS_PER_DAY *
      1000
    );
  }

  private async consume(rawToken: string): Promise<string> {
    const parsed = parseToken(rawToken);
    if (!parsed) {
      throw new InvalidRefreshTokenException();
    }

    const record = await this.refreshTokens.findById(parsed.id);
    if (!record) {
      throw new InvalidRefreshTokenException();
    }

    // Reuse of an already-revoked token => compromise: revoke the whole family.
    if (record.revokedAt) {
      await this.refreshTokens.revokeAllForUser(record.userId);
      throw new InvalidRefreshTokenException();
    }

    if (record.expiresAt.getTime() < Date.now()) {
      throw new InvalidRefreshTokenException();
    }

    if (!secretMatches(parsed.secret, record.tokenHash)) {
      throw new InvalidRefreshTokenException();
    }

    await this.refreshTokens.revoke(record.id);
    return record.userId;
  }
}

function parseToken(rawToken: string): { id: string; secret: string } | null {
  const separatorIndex = rawToken.indexOf(TOKEN_SEPARATOR);
  if (separatorIndex <= 0) {
    return null;
  }
  const id = rawToken.slice(0, separatorIndex);
  const secret = rawToken.slice(separatorIndex + 1);
  if (!id || !secret) {
    return null;
  }
  return { id, secret };
}

function hashSecret(secret: string): string {
  return createHash('sha256').update(secret).digest('hex');
}

function secretMatches(secret: string, expectedHash: string): boolean {
  const actual = Buffer.from(hashSecret(secret), 'hex');
  const expected = Buffer.from(expectedHash, 'hex');
  if (actual.length !== expected.length) {
    return false;
  }
  return timingSafeEqual(actual, expected);
}
