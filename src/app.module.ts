import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { TodoitemsModule } from './todoitems/todoitems.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import * as fs from 'fs';
import * as path from 'path';

const databaseUrl =
  process.env.DATABASE_URL ||
  'mongodb://localhost:27017/inventory-management-api';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [],
      inject: [],
      useFactory: () => ({
        secret: fs.readFileSync(path.join('.env.stage.dev.json')).toJSON().data[
          'jwt_secret'
        ],
        signOptions: {
          expiresIn: fs.readFileSync(path.join('.env.stage.dev.json')).toJSON()
            .data['jwt_expiry'],
        },
      }),
    }),
    MongooseModule.forRoot(databaseUrl),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    TodoitemsModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {}
