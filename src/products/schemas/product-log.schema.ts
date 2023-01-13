import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ProductLogSchemaInterface } from '../v1/interfaces/product-log.interface';

export type ProductLogDocument = ProductLog & Document;

@Schema()
export class ProductLog implements ProductLogSchemaInterface {
  @Prop()
  productId: string;

  @Prop()
  userId: string;

  @Prop()
  event: string;

  @Prop()
  quantity: number;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ProductLogSchema = SchemaFactory.createForClass(ProductLog);
