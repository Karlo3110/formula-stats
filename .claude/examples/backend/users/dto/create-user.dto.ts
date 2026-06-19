import { IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { UserRole } from '../types/user.types';

/**
 * Request DTO for creating a user. Validation decorators are enforced by the global
 * ValidationPipe (whitelist + forbidNonWhitelisted + transform). Never trust input.
 * See rules/05-security.md §3, rules/backend/nestjs.md.
 */
export class CreateUserDto {
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  firstName!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  lastName!: string;

  @IsString()
  @MinLength(12)
  @MaxLength(128)
  password!: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
