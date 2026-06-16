import { IsOptional, IsString, IsNumber, IsEnum, IsBoolean, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum SortBy {
  NAME = 'name',
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  NEWEST = 'newest',
}

export enum ProductStatus {
  ALL = 'all',
  AVAILABLE = 'available',
  EXPIRING_SOON = 'expiring_soon',
  EXPIRED = 'expired',
}

export class FilterProductsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsEnum(SortBy)
  sortBy?: SortBy = SortBy.NAME;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus = ProductStatus.ALL;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  inStock?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number = 0;
}