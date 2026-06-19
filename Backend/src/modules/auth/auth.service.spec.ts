import type { ConfigService } from '@nestjs/config';
import type { User } from '@prisma/client';

import {
  EmailAlreadyRegisteredException,
  InvalidResetTokenException,
} from '@/common/exceptions/domain.exception';
import type { CacheService } from '@/redis/cache.service';
import type { MailerService } from '@/mail/mailer.service';
import type { UsersRepository } from '@/modules/users/users.repository';

import { AuthService } from './auth.service';
import type { TokenService } from './token.service';
import type { RegisterDto } from './dto/register.dto';
import type { ResetPasswordDto } from './dto/reset-password.dto';

function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: 'u_1',
    email: 'driver@example.com',
    passwordHash: 'hash',
    displayName: 'Driver',
    role: 'MEMBER',
    status: 'PENDING_VERIFICATION',
    emailVerifiedAt: null,
    lastLoginAt: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    deletedAt: null,
    ...overrides,
  };
}

describe('AuthService', () => {
  let usersRepository: jest.Mocked<Pick<UsersRepository, 'findByEmail'>>;
  let cache: jest.Mocked<Pick<CacheService, 'get'>>;
  let service: AuthService;

  beforeEach(() => {
    usersRepository = { findByEmail: jest.fn() };
    cache = { get: jest.fn() };
    service = new AuthService(
      usersRepository as unknown as UsersRepository,
      {} as TokenService,
      cache as unknown as CacheService,
      {} as MailerService,
      {} as ConfigService,
    );
  });

  describe('register', () => {
    it('throws when the email is already registered', async () => {
      usersRepository.findByEmail.mockResolvedValue(createMockUser());
      const dto: RegisterDto = {
        email: 'driver@example.com',
        password: 'a-very-strong-password',
        displayName: 'Driver',
      };

      await expect(service.register(dto)).rejects.toThrow(
        EmailAlreadyRegisteredException,
      );
    });
  });

  describe('resetPassword', () => {
    it('throws when the reset token is unknown or expired', async () => {
      cache.get.mockResolvedValue(null);
      const dto: ResetPasswordDto = {
        token: 'missing',
        newPassword: 'a-very-strong-password',
      };

      await expect(service.resetPassword(dto)).rejects.toThrow(
        InvalidResetTokenException,
      );
    });
  });
});
