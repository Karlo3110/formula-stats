import { Module } from '@nestjs/common';

import { PasswordHasher } from '@/common/security/password-hasher';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

/**
 * Wires the feature together and defines its public surface. The DatabaseModule
 * (providing PrismaService) is @Global, so it isn't re-imported here.
 * `exports` is the feature's public API — other modules consume UsersService, never the
 * repository or internals. See rules/04-file-organization.md §5, rules/backend/nestjs.md.
 */
@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, PasswordHasher],
  exports: [UsersService],
})
export class UsersModule {}
