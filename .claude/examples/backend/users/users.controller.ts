import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { PaginatedResponse, UserResponse } from './dto/user-response.dto';
import { UsersService } from './users.service';
import { AuthenticatedUser, UserRole } from './types/user.types';

/**
 * Thin HTTP transport. Validates (DTOs + global ValidationPipe), authorizes (guards),
 * delegates to the service, and returns the mapped result. No business logic, no data
 * access. Authenticated identity comes from the verified token, never the body.
 * See architecture/api-architecture.md, rules/05-security.md §4.
 */
@Controller('v1/users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.Admin)
  async list(@Query() query: ListUsersQueryDto): Promise<PaginatedResponse<UserResponse>> {
    return this.usersService.list(query);
  }

  @Get('me')
  async me(@CurrentUser() user: AuthenticatedUser): Promise<UserResponse> {
    return this.usersService.findById(user.id);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.Admin)
  async getOne(@Param('id') id: string): Promise<UserResponse> {
    return this.usersService.findById(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.Admin)
  async create(@Body() dto: CreateUserDto): Promise<UserResponse> {
    return this.usersService.create(dto);
  }
}
