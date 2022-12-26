export enum REGISTRATION_ENUM {
  SUCCESS = 'Registration Successful. Please sign in!',
  REGISTRATION_FAILED = 'User registration failed!',
  PASSWORD_MISMATCH = 'Password must match password confirmation!',
  USERNAME_CONFLICT = 'A user with the same username exists!',
  EMAIL_CONFLICT = 'A user with the same email exists!',
}

export enum AUTH_ENUM {
  INVALID_CREDENTIALS = 'Invalid authentication credentials!',
}

export enum GENERAL_ERROR {}
