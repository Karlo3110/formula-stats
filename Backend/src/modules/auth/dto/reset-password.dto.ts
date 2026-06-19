import { IsString, MaxLength, MinLength } from 'class-validator';

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;

export class ResetPasswordDto {
  @IsString()
  @MinLength(1)
  @MaxLength(256)
  token!: string;

  @IsString()
  @MinLength(MIN_PASSWORD_LENGTH)
  @MaxLength(MAX_PASSWORD_LENGTH)
  newPassword!: string;
}
