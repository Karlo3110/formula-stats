import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '@/database/prisma.service';
import { PasswordHasher } from '@/common/security/password-hasher';
import { CreateUserDto } from './dto/create-user.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { PaginatedResponse, UserResponse } from './dto/user-response.dto';
import { User } from './entities/user.entity';
import { EmailAlreadyInUseException, UserNotFoundException } from './exceptions/user.exceptions';
import { UsersRepository } from './users.repository';
import { UserRole } from './types/user.types';

/**
 * Business logic + orchestration. Knows nothing about HTTP — it throws typed domain
 * exceptions and returns response DTOs. Multi-step writes are transactional. Collaborators
 * are injected. See architecture/backend-architecture.md, rules/backend/nestjs.md.
 */
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly prisma: PrismaService,
  ) {}

  async findById(id: string): Promise<UserResponse> {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new UserNotFoundException(id);
    return this.toResponse(user);
  }

  async list(query: ListUsersQueryDto): Promise<PaginatedResponse<UserResponse>> {
    const { items, total } = await this.usersRepository.list(query);
    return {
      data: items.map((user) => this.toResponse(user)),
      meta: {
        limit: query.limit,
        offset: query.offset,
        total,
        hasMore: query.offset + items.length < total,
      },
    };
  }

  /**
   * Creates a user atomically: uniqueness check + hash + insert in one transaction so a
   * race can't slip a duplicate through between the check and the write.
   */
  async create(dto: CreateUserDto): Promise<UserResponse> {
    this.logger.log(`Creating user: ${dto.email}`);

    const passwordHash = await this.passwordHasher.hash(dto.password);

    const user = await this.prisma.$transaction(async (tx) => {
      const existing = await this.usersRepository.findByEmail(dto.email, tx);
      if (existing) throw new EmailAlreadyInUseException(dto.email);

      return this.usersRepository.create(
        { ...dto, role: dto.role ?? UserRole.User, passwordHash },
        tx,
      );
    });

    this.logger.log(`User created: ${user.id}`);
    return this.toResponse(user);
  }

  /** Single mapping point from domain entity → public response DTO. */
  private toResponse(user: User): UserResponse {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
