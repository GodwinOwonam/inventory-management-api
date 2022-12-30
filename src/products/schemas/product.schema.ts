import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ProductSchemaInterface } from 'src/products/v1/interfaces/product.interface';

export type ProductDocument = Product & Document;

@Schema()
export class Product implements ProductSchemaInterface {
  @Prop()
  userId: string;

  @Prop({ unique: true, type: String })
  name: string;

  @Prop()
  description: string;

  @Prop()
  price: number;

  @Prop()
  unitsAvailable: number;

  @Prop()
  minimumOrderLevel: number;

  @Prop()
  hasExpiry: boolean;

  @Prop({ default: new Date() })
  createdAt: Date;

  @Prop({ default: new Date() })
  updatedAt: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
