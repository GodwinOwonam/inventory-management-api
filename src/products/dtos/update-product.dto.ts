import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class ProductUpdateDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  price: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  unitsAvailable: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  minimumOrderLevel: number;

  @IsOptional()
  @IsBoolean()
  hasExpiry: boolean;
}
