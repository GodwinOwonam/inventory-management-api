import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SignUpCredentialsDto } from 'src/auth/dtos/auth-signup.dto';
import { User, UserDocument } from 'src/auth/schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { UserSchemaInterface } from '../interfaces/user.interface';
import { REGISTRATION_ENUM, AUTH_ENUM } from '../constants/enums/auth-enums';
import { SignInCredentialsDto } from 'src/auth/dtos/auth-sign-in.dto';
import * as fs from 'fs';
import * as path from 'path';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectModel(User.name)
    private model: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async createUser(
    authSignupCredentials: SignUpCredentialsDto,
  ): Promise<string> {
    try {
      const { username, email, password } = authSignupCredentials;

      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);

      const user: UserSchemaInterface = await this.model.create({
        username,
        email,
        password: hashedPassword,
        requiresLogin: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      if (user) {
        return REGISTRATION_ENUM.SUCCESS;
      }

      return REGISTRATION_ENUM.REGISTRATION_FAILED;
    } catch (error) {
      if (error.code == 11000) {
        if (error.keyPattern?.username) {
          throw new ConflictException(REGISTRATION_ENUM.USERNAME_CONFLICT);
        } else if (error.keyPattern?.email) {
          throw new ConflictException(REGISTRATION_ENUM.EMAIL_CONFLICT);
        }
      }

      throw new InternalServerErrorException();
    }
  }

  async login(authCredentials: SignInCredentialsDto): Promise<any> {
    const { email, password } = authCredentials;

    const user = await this.model.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException(AUTH_ENUM.INVALID_CREDENTIALS);
    }

    const payload = { username: user.username };
    const jwt_secret = JSON.parse(
      fs.readFileSync(path.join('.env.stage.dev.json')).toString(),
    ).jwt_secret;
    const jwt_expiry = JSON.parse(
      fs.readFileSync(path.join('.env.stage.dev.json')).toString(),
    ).jwt_expiry;

    const accessToken = this.jwtService.sign(payload, {
      secret: jwt_secret,
      expiresIn: +jwt_expiry,
    });

    await this.model.findOneAndUpdate(
      { _id: user._id },
      {
        requiresLogin: false,
      },
    );

    return {
      user: { username: user.username, email: user.email },
      accessToken,
    };
  }
}
