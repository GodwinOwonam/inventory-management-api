import {
  IsBoolean,
  IsNumberString,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class ProductUploadDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsOptional()
  @IsNumberString()
  @IsPositive()
  price: number;

  @IsOptional()
  @IsNumberString()
  @IsPositive()
  units_available: number;

  @IsOptional()
  @IsNumberString()
  @IsPositive()
  minimum_order_level: number;

  @IsOptional()
  @IsBoolean()
  hasExpiry: boolean;
}
