import { Test } from '@nestjs/testing';

import { PrismaService } from '@/database/prisma.service';
import { PasswordHasher } from '@/common/security/password-hasher';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { User } from './entities/user.entity';
import { EmailAlreadyInUseException, UserNotFoundException } from './exceptions/user.exceptions';
import { UserRecord, UserRole, UserStatus } from './types/user.types';

/**
 * Behavior-focused unit tests. We mock the repository and infrastructure (boundaries) and
 * assert observable outcomes — not internal calls. Each test can fail for a real reason.
 * See rules/07-testing.md.
 */
function createUserRecord(overrides: Partial<UserRecord> = {}): UserRecord {
  return {
    id: 'usr_1',
    email: 'jane@example.com',
    firstName: 'Jane',
    lastName: 'Doe',
    role: UserRole.User,
    status: UserStatus.Active,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<UsersRepository>;
  let prisma: { $transaction: jest.Mock };

  beforeEach(async () => {
    repository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      list: jest.fn(),
    } as unknown as jest.Mocked<UsersRepository>;

    // $transaction runs the callback with a fake tx client immediately.
    prisma = { $transaction: jest.fn((cb: (tx: unknown) => unknown) => cb({})) };

    const hasher: Partial<PasswordHasher> = { hash: jest.fn().mockResolvedValue('hashed') };

    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: repository },
        { provide: PasswordHasher, useValue: hasher },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = moduleRef.get(UsersService);
  });

  describe('findById', () => {
    it('returns the mapped user when one exists', async () => {
      repository.findById.mockResolvedValue(User.fromRecord(createUserRecord()));

      const result = await service.findById('usr_1');

      expect(result).toEqual(
        expect.objectContaining({ id: 'usr_1', email: 'jane@example.com', fullName: 'Jane Doe' }),
      );
    });

    it('throws UserNotFoundException when the user does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById('missing')).rejects.toThrow(UserNotFoundException);
    });
  });

  describe('create', () => {
    it('creates and returns the user when the email is free', async () => {
      repository.findByEmail.mockResolvedValue(null);
      repository.create.mockResolvedValue(User.fromRecord(createUserRecord()));

      const result = await service.create({
        email: 'jane@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
        password: 'a-very-strong-pass',
      });

      expect(result.email).toBe('jane@example.com');
      expect(repository.create).toHaveBeenCalledTimes(1);
    });

    it('throws EmailAlreadyInUseException when the email is taken', async () => {
      repository.findByEmail.mockResolvedValue(User.fromRecord(createUserRecord()));

      await expect(
        service.create({
          email: 'jane@example.com',
          firstName: 'Jane',
          lastName: 'Doe',
          password: 'a-very-strong-pass',
        }),
      ).rejects.toThrow(EmailAlreadyInUseException);
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('list', () => {
    it('returns a paginated envelope with hasMore computed correctly', async () => {
      repository.list.mockResolvedValue({
        items: [User.fromRecord(createUserRecord())],
        total: 5,
      });

      const result = await service.list({ limit: 1, offset: 0 });

      expect(result.data).toHaveLength(1);
      expect(result.meta).toEqual({ limit: 1, offset: 0, total: 5, hasMore: true });
    });
  });
});
