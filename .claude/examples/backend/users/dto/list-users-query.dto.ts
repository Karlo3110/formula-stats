import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { UserStatus } from '../types/user.types';

/**
 * Query DTO for listing users. Pagination is mandatory and bounded — never unbounded.
 * `transform: true` coerces string query params to numbers. See rules/06-performance.md,
 * architecture/api-architecture.md.
 */
export class ListUsersQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset: number = 0;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  /** Free-text search over name/email; allow-listed server-side, never raw into SQL. */
  @IsOptional()
  @IsString()
  search?: string;
}
