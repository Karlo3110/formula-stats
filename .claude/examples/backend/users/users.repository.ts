import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '@/database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { User } from './entities/user.entity';
import { PaginatedResult, UserRecord, UserStatus } from './types/user.types';

/**
 * The ONLY layer that touches the ORM. Returns domain entities, never raw Prisma models
 * leaked upward. Contains no business rules. Accepts an optional transaction client so
 * the service can compose atomic multi-step writes.
 * See architecture/backend-architecture.md, rules/backend/nestjs.md.
 */
@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  private client(tx?: Prisma.TransactionClient): Prisma.TransactionClient | PrismaService {
    return tx ?? this.prisma;
  }

  async findById(id: string, tx?: Prisma.TransactionClient): Promise<User | null> {
    const record = await this.client(tx).user.findUnique({ where: { id } });
    return record ? User.fromRecord(this.toRecord(record)) : null;
  }

  async findByEmail(email: string, tx?: Prisma.TransactionClient): Promise<User | null> {
    const record = await this.client(tx).user.findUnique({ where: { email } });
    return record ? User.fromRecord(this.toRecord(record)) : null;
  }

  async create(
    data: CreateUserDto & { passwordHash: string },
    tx?: Prisma.TransactionClient,
  ): Promise<User> {
    const record = await this.client(tx).user.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        passwordHash: data.passwordHash,
        role: data.role,
        status: UserStatus.Active,
      },
    });
    return User.fromRecord(this.toRecord(record));
  }

  /** Bounded, indexed list query. No N+1, projects via the entity mapper, paginates. */
  async list(query: ListUsersQueryDto): Promise<PaginatedResult<User>> {
    const where: Prisma.UserWhereInput = {
      status: query.status ?? { not: UserStatus.Deleted },
      ...(query.search
        ? {
            OR: [
              { email: { contains: query.search, mode: 'insensitive' } },
              { firstName: { contains: query.search, mode: 'insensitive' } },
              { lastName: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [records, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        take: query.limit,
        skip: query.offset,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items: records.map((r) => User.fromRecord(this.toRecord(r))), total };
  }

  /** Maps the persistence model to the domain record. Single mapping point. */
  private toRecord(model: Prisma.UserGetPayload<true>): UserRecord {
    return {
      id: model.id,
      email: model.email,
      firstName: model.firstName,
      lastName: model.lastName,
      role: model.role as UserRecord['role'],
      status: model.status as UserRecord['status'],
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };
  }
}
