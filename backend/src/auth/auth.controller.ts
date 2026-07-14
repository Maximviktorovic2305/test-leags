import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CookieOptions, Response } from 'express';
import {
  REFRESH_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_PATH,
} from './auth-cookie.constants';
import { getAuthTokenSettings } from './auth-token-config';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { GetUser } from './get-user.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtRefreshGuard } from './jwt-refresh.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(dto);
    this.setRefreshCookie(response, result.refreshToken);
    return { user: result.user, accessToken: result.accessToken };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@GetUser('id') userId: string) {
    return this.authService.getMe(userId);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  async refresh(
    @GetUser('id') userId: string,
    @GetUser('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const tokens = await this.authService.refreshTokens(userId, refreshToken);
    this.setRefreshCookie(response, tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async logout(
    @GetUser('id') userId: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.logout(userId);
    response.clearCookie(
      REFRESH_TOKEN_COOKIE_NAME,
      this.getBaseCookieOptions(),
    );
    return { message: 'Успешный выход' };
  }

  private setRefreshCookie(response: Response, refreshToken: string): void {
    const settings = getAuthTokenSettings(this.config);
    response.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      ...this.getBaseCookieOptions(),
      maxAge: settings.refreshTokenTtlMs,
    });
  }

  private getBaseCookieOptions(): CookieOptions {
    const isProduction = this.config.get('NODE_ENV') === 'production';
    const domain = this.config.get<string>('COOKIE_DOMAIN');
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: REFRESH_TOKEN_COOKIE_PATH,
      ...(domain ? { domain } : {}),
    };
  }
}
