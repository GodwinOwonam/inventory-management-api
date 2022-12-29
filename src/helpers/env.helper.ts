import { InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export const getFromEnv = (key: string, env: string) => {
  try {
    return JSON.parse(
      fs.readFileSync(path.join(`.env.stage.${env}.json`)).toString(),
    )[key];
  } catch (error) {
    throw new InternalServerErrorException(error.message);
  }
};
