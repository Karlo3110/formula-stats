import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import type { CookieOptions, Request, Response } from 'express';

import { Public } from '@/common/decorators/public.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { InvalidRefreshTokenException } from '@/common/exceptions/domain.exception';
import type { AuthenticatedUser } from '@/common/types/authenticated-user';
import { UsersService } from '@/modules/users/users.service';
import type { UserResponseDto } from '@/modules/users/dto/user-response.dto';

import { AuthService, type AuthTokens } from './auth.service';
import { TokenService } from './token.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { EmailOnlyDto } from './dto/email-only.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

const REFRESH_COOKIE_NAME = 'refresh_token';
const REFRESH_COOKIE_PATH = '/api/v1/auth';
const AUTH_THROTTLE = { default: { limit: 5, ttl: 60_000 } };

interface SessionResponse {
  user: UserResponseDto;
  accessToken: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
    private readonly usersService: UsersService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Throttle(AUTH_THROTTLE)
  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<UserResponseDto> {
    return this.authService.register(dto);
  }

  @Public()
  @Throttle(AUTH_THROTTLE)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SessionResponse> {
    const tokens = await this.authService.login(dto);
    return this.writeSession(tokens, res);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SessionResponse> {
    const rawToken = readRefreshCookie(req);
    if (!rawToken) {
      throw new InvalidRefreshTokenException();
    }
    const tokens = await this.authService.refresh(rawToken);
    return this.writeSession(tokens, res);
  }

  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.authService.logout(readRefreshCookie(req));
    res.clearCookie(REFRESH_COOKIE_NAME, this.baseCookieOptions());
  }

  @Public()
  @Throttle(AUTH_THROTTLE)
  @HttpCode(HttpStatus.OK)
  @Post('verify-email')
  async verifyEmail(@Body() dto: VerifyEmailDto): Promise<UserResponseDto> {
    return this.authService.verifyEmail(dto);
  }

  @Public()
  @Throttle(AUTH_THROTTLE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('resend-verification')
  async resendVerification(@Body() dto: EmailOnlyDto): Promise<void> {
    await this.authService.resendVerification(dto.email);
  }

  @Public()
  @Throttle(AUTH_THROTTLE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('forgot-password')
  async forgotPassword(@Body() dto: EmailOnlyDto): Promise<void> {
    await this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Throttle(AUTH_THROTTLE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<void> {
    await this.authService.resetPassword(dto);
  }

  @Get('me')
  async me(@CurrentUser() user: AuthenticatedUser): Promise<UserResponseDto> {
    return this.usersService.findById(user.id);
  }

  private writeSession(tokens: AuthTokens, res: Response): SessionResponse {
    res.cookie(REFRESH_COOKIE_NAME, tokens.refreshToken, {
      ...this.baseCookieOptions(),
      maxAge: this.tokenService.refreshCookieMaxAgeMs(),
    });
    return { user: tokens.user, accessToken: tokens.accessToken };
  }

  private baseCookieOptions(): CookieOptions {
    const isProduction =
      this.config.getOrThrow<string>('NODE_ENV') === 'production';
    const domain = this.config.get<string>('COOKIE_DOMAIN');
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: REFRESH_COOKIE_PATH,
      ...(domain ? { domain } : {}),
    };
  }
}

function readRefreshCookie(req: Request): string | undefined {
  const cookies = (req as Request & { cookies?: Record<string, string> })
    .cookies;
  return cookies?.[REFRESH_COOKIE_NAME];
}
