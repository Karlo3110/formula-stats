import { Injectable } from '@nestjs/common';
import type { User } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';

import type { AccountStatus } from './types/account-status';

interface CreateUserData {
  email: string;
  passwordHash: string;
  displayName: string;
}

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findFirst({ where: { id, deletedAt: null } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { email: email.toLowerCase(), deletedAt: null },
    });
  }

  create(data: CreateUserData): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        displayName: data.displayName,
      },
    });
  }

  setStatus(id: string, status: AccountStatus): Promise<User> {
    return this.prisma.user.update({ where: { id }, data: { status } });
  }

  markEmailVerified(id: string, status: AccountStatus): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { status, emailVerifiedAt: new Date() },
    });
  }

  setPasswordHash(id: string, passwordHash: string): Promise<User> {
    return this.prisma.user.update({ where: { id }, data: { passwordHash } });
  }

  setLastLogin(id: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }
}
