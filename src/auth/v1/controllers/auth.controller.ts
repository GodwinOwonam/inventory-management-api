import { Controller, Post, Body } from '@nestjs/common';
import { SignInCredentialsDto } from 'src/auth/dtos/auth-sign-in.dto';
import { SignUpCredentialsDto } from 'src/auth/dtos/auth-signup.dto';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() authCredentials: SignUpCredentialsDto) {
    return await this.authService.register(authCredentials);
  }

  @Post('sign-in')
  async login(@Body() authCredentials: SignInCredentialsDto) {
    return await this.authService.login(authCredentials);
  }
}
