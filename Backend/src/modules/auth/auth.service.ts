import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import type { User } from '@prisma/client';

import { CacheService } from '@/redis/cache.service';
import { MailerService } from '@/mail/mailer.service';
import {
  AccountNotActiveException,
  EmailAlreadyRegisteredException,
  InvalidCredentialsException,
  InvalidResetTokenException,
  InvalidVerificationCodeException,
} from '@/common/exceptions/domain.exception';
import type { Role } from '@/common/types/authenticated-user';

import { UsersRepository } from '@/modules/users/users.repository';
import {
  toUserResponse,
  type UserResponseDto,
} from '@/modules/users/dto/user-response.dto';
import { AccountStatus } from '@/modules/users/types/account-status';

import {
  RESET_TOKEN_BYTES,
  VERIFICATION_CODE_LENGTH,
  resetTokenCacheKey,
  verificationCacheKey,
} from './auth.constants';
import type { RegisterDto } from './dto/register.dto';
import type { LoginDto } from './dto/login.dto';
import type { VerifyEmailDto } from './dto/verify-email.dto';
import type { ResetPasswordDto } from './dto/reset-password.dto';
import { TokenService } from './token.service';

export interface AuthTokens {
  user: UserResponseDto;
  accessToken: string;
  refreshToken: string;
}

const MINUTE_IN_SECONDS = 60;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly tokenService: TokenService,
    private readonly cache: CacheService,
    private readonly mailer: MailerService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<UserResponseDto> {
    const existing = await this.usersRepository.findByEmail(dto.email);
    if (existing) {
      throw new EmailAlreadyRegisteredException();
    }

    const passwordHash = await this.hashPassword(dto.password);
    const user = await this.usersRepository.create({
      email: dto.email,
      passwordHash,
      displayName: dto.displayName,
    });

    await this.sendVerificationCode(user);
    this.logger.log(`User registered: ${user.id}`);
    return toUserResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthTokens> {
    const user = await this.usersRepository.findByEmail(dto.email);
    if (!user) {
      throw new InvalidCredentialsException();
    }

    const passwordValid = await argon2.verify(user.passwordHash, dto.password);
    if (!passwordValid) {
      throw new InvalidCredentialsException();
    }

    if (user.status !== AccountStatus.Active) {
      throw new AccountNotActiveException();
    }

    await this.usersRepository.setLastLogin(user.id);
    return this.issueTokens(user);
  }

  async verifyEmail(dto: VerifyEmailDto): Promise<UserResponseDto> {
    const user = await this.usersRepository.findByEmail(dto.email);
    if (!user) {
      throw new InvalidVerificationCodeException();
    }
    if (user.status === AccountStatus.Active) {
      return toUserResponse(user);
    }

    const storedCode = await this.cache.get<string>(
      verificationCacheKey(user.id),
    );
    if (!storedCode || !codesMatch(storedCode, dto.code)) {
      throw new InvalidVerificationCodeException();
    }

    const verified = await this.usersRepository.markEmailVerified(
      user.id,
      AccountStatus.Active,
    );
    await this.cache.delete(verificationCacheKey(user.id));
    this.logger.log(`Email verified: ${user.id}`);
    return toUserResponse(verified);
  }

  async resendVerification(email: string): Promise<void> {
    const user = await this.usersRepository.findByEmail(email);
    if (user && user.status === AccountStatus.PendingVerification) {
      await this.sendVerificationCode(user);
    }
    // Always resolve to avoid leaking which emails are registered.
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      return; // Do not reveal whether the email exists.
    }

    const token = randomBytes(RESET_TOKEN_BYTES).toString('base64url');
    const ttlSeconds =
      this.config.getOrThrow<number>('PASSWORD_RESET_TTL_MIN') *
      MINUTE_IN_SECONDS;
    await this.cache.set(resetTokenCacheKey(token), user.id, ttlSeconds);

    const resetUrl = `${this.config.getOrThrow<string>('APP_WEB_URL')}/reset-password?token=${token}`;
    try {
      await this.mailer.sendPasswordReset({
        to: user.email,
        displayName: user.displayName,
        resetUrl,
      });
    } catch {
      // Logged in the mailer; never surface email failures on this endpoint.
    }
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const key = resetTokenCacheKey(dto.token);
    const userId = await this.cache.get<string>(key);
    if (!userId) {
      throw new InvalidResetTokenException();
    }

    const passwordHash = await this.hashPassword(dto.newPassword);
    await this.usersRepository.setPasswordHash(userId, passwordHash);
    await this.cache.delete(key);
    await this.tokenService.revokeAllForUser(userId);
    this.logger.log(`Password reset: ${userId}`);
  }

  async refresh(rawToken: string): Promise<AuthTokens> {
    const { userId, refreshToken } =
      await this.tokenService.rotateRefreshToken(rawToken);
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new InvalidCredentialsException();
    }
    const accessToken = await this.tokenService.issueAccessToken({
      id: user.id,
      email: user.email,
      role: user.role as Role,
    });
    return { user: toUserResponse(user), accessToken, refreshToken };
  }

  async logout(rawToken: string | undefined): Promise<void> {
    if (rawToken) {
      await this.tokenService.revokeRefreshToken(rawToken);
    }
  }

  private async issueTokens(user: User): Promise<AuthTokens> {
    const accessToken = await this.tokenService.issueAccessToken({
      id: user.id,
      email: user.email,
      role: user.role as Role,
    });
    const refreshToken = await this.tokenService.issueRefreshToken(user.id);
    return { user: toUserResponse(user), accessToken, refreshToken };
  }

  private async sendVerificationCode(user: User): Promise<void> {
    const code = generateVerificationCode();
    const ttlSeconds =
      this.config.getOrThrow<number>('EMAIL_VERIFICATION_TTL_MIN') *
      MINUTE_IN_SECONDS;
    await this.cache.set(verificationCacheKey(user.id), code, ttlSeconds);
    try {
      await this.mailer.sendVerificationCode({
        to: user.email,
        displayName: user.displayName,
        code,
      });
    } catch {
      // Logged in the mailer; the user can request a resend.
    }
  }

  private hashPassword(password: string): Promise<string> {
    return argon2.hash(password, { type: argon2.argon2id });
  }
}

function generateVerificationCode(): string {
  const max = 10 ** VERIFICATION_CODE_LENGTH;
  return randomInt(0, max).toString().padStart(VERIFICATION_CODE_LENGTH, '0');
}

function codesMatch(expected: string, provided: string): boolean {
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);
  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }
  return timingSafeEqual(expectedBuffer, providedBuffer);
}
