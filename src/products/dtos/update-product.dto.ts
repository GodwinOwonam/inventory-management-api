import {
  IsBoolean,
  IsNumber,
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
