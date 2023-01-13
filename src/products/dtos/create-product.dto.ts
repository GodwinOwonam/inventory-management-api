import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';

export class ProductUploadDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  price: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  unitsAvailable: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  minimumOrderLevel: number;

  @IsNotEmpty()
  @IsBoolean()
  hasExpiry: boolean;
}
