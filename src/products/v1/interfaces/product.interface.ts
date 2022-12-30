export interface ProductSchemaInterface {
  userId: string;

  name: string;

  description: string;

  price: number;

  unitsAvailable: number;

  minimumOrderLevel: number;

  hasExpiry: boolean;

  createdAt: Date;

  updatedAt: Date;
}
