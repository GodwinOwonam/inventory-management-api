import { IsString, IsOptional, Matches } from 'class-validator';

export class ProfileUpdateCredentials {
  @IsString()
  @IsOptional()
  fullName: string;

  @IsString()
  @IsOptional()
  businessAddress: string;

  @IsOptional()
  @IsString()
  @Matches(
    /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
    {
      message: 'Invalid email!',
    },
  )
  businessEmail: string;
}
