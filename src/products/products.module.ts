import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from 'src/auth/auth.module';
import { getFromEnv } from 'src/helpers/env.helper';
import {
  ProductPhoto,
  ProductPhotoSchema,
} from './schemas/product-photo.schema';
import { Product, ProductSchema } from './schemas/product.schema';
import { ProductsController } from './v1/controllers/products.controller';
import { ProductsRepository } from './v1/repositories/products.repository';
import { ProductsService } from './v1/services/products.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [],
      inject: [],
      useFactory: () => ({
        secret: getFromEnv('jwt_secret'),
        signOptions: {
          expiresIn: getFromEnv('jwt_expiry'),
        },
      }),
    }),
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: ProductPhoto.name, schema: ProductPhotoSchema },
    ]),
    AuthModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService, ProductsRepository],
})
export class ProductsModule {}
