/**
 * Jedinični testovi sloja autentikacije (poglavlje 6.1).
 *
 * Smjestiti u: Backend/src/modules/auth/auth.flows.spec.ts
 * Pokretanje:  npm test
 *
 * Ovisnosti su zamijenjene nadomjesnim objektima, pa se testira isključivo
 * poslovna logika servisnog sloja, neovisno o bazi podataka, Redisu i
 * slanju elektroničke pošte.
 */

import { ConfigService } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';
import * as argon2 from 'argon2';
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
import { UsersRepository } from '@/modules/users/users.repository';
import { AccountStatus } from '@/modules/users/types/account-status';

import { AuthService } from './auth.service';
import { TokenService } from './token.service';

const PASSWORD = 'Lozinka123!';

function buildUser(overrides: Partial<User> = {}): User {
  return {
    id: '00000000-0000-7000-8000-000000000001',
    email: 'korisnik@example.com',
    passwordHash: 'hash',
    displayName: 'Korisnik',
    role: 'MEMBER',
    status: AccountStatus.Active,
    emailVerifiedAt: new Date(),
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  } as User;
}

describe('AuthService — funkcionalno testiranje', () => {
  let service: AuthService;
  let usersRepository: jest.Mocked<UsersRepository>;
  let tokenService: jest.Mocked<TokenService>;
  let cache: jest.Mocked<CacheService>;
  let mailer: jest.Mocked<MailerService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersRepository,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            setLastLogin: jest.fn(),
            setPasswordHash: jest.fn(),
            markEmailVerified: jest.fn(),
          },
        },
        {
          provide: TokenService,
          useValue: {
            issueAccessToken: jest.fn().mockResolvedValue('access-token'),
            issueRefreshToken: jest.fn().mockResolvedValue('refresh-token'),
            rotateRefreshToken: jest.fn(),
            revokeRefreshToken: jest.fn(),
            revokeAllForUser: jest.fn(),
          },
        },
        {
          provide: CacheService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            delete: jest.fn(),
            deleteByPrefix: jest.fn(),
          },
        },
        {
          provide: MailerService,
          useValue: {
            sendVerificationCode: jest.fn(),
            sendPasswordReset: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: { getOrThrow: jest.fn().mockReturnValue(15) },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    usersRepository = module.get(UsersRepository);
    tokenService = module.get(TokenService);
    cache = module.get(CacheService);
    mailer = module.get(MailerService);
  });

  describe('registracija', () => {
    it('stvara račun i šalje kôd za potvrdu', async () => {
      usersRepository.findByEmail.mockResolvedValue(null);
      usersRepository.create.mockResolvedValue(
        buildUser({ status: AccountStatus.PendingVerification }),
      );

      const result = await service.register({
        email: 'novi@example.com',
        password: PASSWORD,
        displayName: 'Novi',
      });

      expect(usersRepository.create).toHaveBeenCalled();
      expect(mailer.sendVerificationCode).toHaveBeenCalled();
      expect(result.email).toBeDefined();
    });

    it('odbija registraciju s već postojećom adresom', async () => {
      usersRepository.findByEmail.mockResolvedValue(buildUser());

      await expect(
        service.register({
          email: 'korisnik@example.com',
          password: PASSWORD,
          displayName: 'Korisnik',
        }),
      ).rejects.toBeInstanceOf(EmailAlreadyRegisteredException);
    });

    it('ne pohranjuje lozinku u izvornom obliku', async () => {
      usersRepository.findByEmail.mockResolvedValue(null);
      usersRepository.create.mockResolvedValue(buildUser());

      await service.register({
        email: 'novi@example.com',
        password: PASSWORD,
        displayName: 'Novi',
      });

      const [args] = usersRepository.create.mock.calls[0] ?? [];
      expect(args?.passwordHash).toBeDefined();
      expect(args?.passwordHash).not.toBe(PASSWORD);
      expect(args?.passwordHash.startsWith('$argon2id$')).toBe(true);
    });
  });

  describe('prijava', () => {
    it('izdaje tokene pri ispravnim podacima', async () => {
      const passwordHash: string = await argon2.hash(PASSWORD);
      usersRepository.findByEmail.mockResolvedValue(buildUser({ passwordHash }));

      const result = await service.login({
        email: 'korisnik@example.com',
        password: PASSWORD,
      });

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(usersRepository.setLastLogin).toHaveBeenCalled();
    });

    it('odbija prijavu s neispravnom lozinkom', async () => {
      const passwordHash: string = await argon2.hash(PASSWORD);
      usersRepository.findByEmail.mockResolvedValue(buildUser({ passwordHash }));

      await expect(
        service.login({ email: 'korisnik@example.com', password: 'pogresna' }),
      ).rejects.toBeInstanceOf(InvalidCredentialsException);
    });

    it('vraća istovjetnu pogrešku za nepostojeći račun', async () => {
      usersRepository.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nepostojeci@example.com', password: PASSWORD }),
      ).rejects.toBeInstanceOf(InvalidCredentialsException);
    });

    it('odbija prijavu neverificiranog računa', async () => {
      const passwordHash: string = await argon2.hash(PASSWORD);
      usersRepository.findByEmail.mockResolvedValue(
        buildUser({ passwordHash, status: AccountStatus.PendingVerification }),
      );

      await expect(
        service.login({ email: 'korisnik@example.com', password: PASSWORD }),
      ).rejects.toBeInstanceOf(AccountNotActiveException);
    });
  });

  describe('potvrda adrese elektroničke pošte', () => {
    it('aktivira račun pri ispravnom kôdu', async () => {
      const user: User = buildUser({
        status: AccountStatus.PendingVerification,
      });
      usersRepository.findByEmail.mockResolvedValue(user);
      cache.get.mockResolvedValue('123456');
      usersRepository.markEmailVerified.mockResolvedValue(
        buildUser({ status: AccountStatus.Active }),
      );

      const result = await service.verifyEmail({
        email: user.email,
        code: '123456',
      });

      expect(usersRepository.markEmailVerified).toHaveBeenCalledWith(
        user.id,
        AccountStatus.Active,
      );
      expect(cache.delete).toHaveBeenCalled();
      expect(result.status).toBe(AccountStatus.Active);
    });

    it('odbija neispravan kôd', async () => {
      usersRepository.findByEmail.mockResolvedValue(
        buildUser({ status: AccountStatus.PendingVerification }),
      );
      cache.get.mockResolvedValue('123456');

      await expect(
        service.verifyEmail({ email: 'korisnik@example.com', code: '000000' }),
      ).rejects.toBeInstanceOf(InvalidVerificationCodeException);
    });
  });

  describe('obnova lozinke', () => {
    it('mijenja lozinku i opoziva sve sesije', async () => {
      cache.get.mockResolvedValue('00000000-0000-7000-8000-000000000001');

      await service.resetPassword({
        token: 'valjani-token',
        newPassword: 'NovaLozinka123!',
      });

      expect(usersRepository.setPasswordHash).toHaveBeenCalled();
      expect(cache.delete).toHaveBeenCalled();
      expect(tokenService.revokeAllForUser).toHaveBeenCalledWith(
        '00000000-0000-7000-8000-000000000001',
      );
    });

    it('odbija nepoznat ili istekao token', async () => {
      cache.get.mockResolvedValue(null);

      await expect(
        service.resetPassword({
          token: 'nepostojeci',
          newPassword: 'NovaLozinka123!',
        }),
      ).rejects.toBeInstanceOf(InvalidResetTokenException);
    });

    it('ne otkriva postojanje računa pri zahtjevu za obnovu', async () => {
      usersRepository.findByEmail.mockResolvedValue(null);

      await expect(
        service.forgotPassword('nepostojeci@example.com'),
      ).resolves.toBeUndefined();
      expect(mailer.sendPasswordReset).not.toHaveBeenCalled();
    });
  });

  describe('odjava', () => {
    it('opoziva token za osvježavanje', async () => {
      await service.logout('refresh-token');
      expect(tokenService.revokeRefreshToken).toHaveBeenCalledWith(
        'refresh-token',
      );
    });
  });
});
