import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { SignUpCredentialsDto } from 'src/auth/dtos/auth-signup.dto';
import { AuthRepository } from '../repositories/auth.repository';
import { IResponse } from '../../../interfaces/response.interface';
import { REGISTRATION_ENUM } from '../constants/enums/auth-enums';
import { SignInCredentialsDto } from 'src/auth/dtos/auth-sign-in.dto';

@Injectable()
export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async register(
    authSignupCredentials: SignUpCredentialsDto,
  ): Promise<IResponse> {
    const { password, confirmPassword } = authSignupCredentials;

    if (password !== confirmPassword) {
      throw new UnprocessableEntityException(
        REGISTRATION_ENUM.PASSWORD_MISMATCH,
      );
    }

    return {
      success: true,
      message: await this.authRepository.createUser(authSignupCredentials),
    };
  }

  async login(authCredentials: SignInCredentialsDto): Promise<IResponse> {
    return {
      success: true,
      data: { ...(await this.authRepository.login(authCredentials)) },
    };
  }
}
