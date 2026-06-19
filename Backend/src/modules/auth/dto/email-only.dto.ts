import { IsEmail, MaxLength } from 'class-validator';

/** Shared body for resend-verification and forgot-password requests. */
export class EmailOnlyDto {
  @IsEmail()
  @MaxLength(254)
  email!: string;
}
