import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import express from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const { accessToken, user } = await this.authService.login(
      dto.username,
      dto.password,
    );

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true, // NGROK HTTPS bo‘lgani uchun true
      sameSite: 'none', // cross-site uchun shart
      path: '/',
    });

    return {
      success: true,
      accessToken,
      user,
    };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: express.Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: true, // LOGIN BILAN BIR XIL
      sameSite: 'none', // LOGIN BILAN BIR XIL
      path: '/',
    });

    return { success: true };
  }
}
