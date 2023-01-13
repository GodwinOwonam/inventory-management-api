import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ProductPhotoSchemaInterface } from '../v1/interfaces/product-photo.interface';

export type ProductPhotoDocument = ProductPhoto & Document;

@Schema()
export class ProductPhoto implements ProductPhotoSchemaInterface {
  @Prop({ unique: true, type: String })
  productId: string;

  @Prop()
  filename: string;

  @Prop({ unique: true, type: String })
  accessUrl: string;

  @Prop({ default: new Date() })
  createdAt: Date;

  @Prop({ default: new Date() })
  updatedAt: Date;
}

export const ProductPhotoSchema = SchemaFactory.createForClass(ProductPhoto);
