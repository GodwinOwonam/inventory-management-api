import {
  IsBoolean,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class SearchAndFilterDto {
  @IsOptional()
  @IsString()
  searchField: string;

  @IsOptional()
  @IsString()
  search: string;

  @IsOptional()
  @IsString()
  filterField: string;

  @IsOptional()
  @IsBoolean()
  filter: true | false;

  @IsOptional()
  @IsNumberString()
  page: number;

  @IsOptional()
  @IsNumberString()
  limit: number;
}
