import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
 @IsString()
 category: string;
 @IsString()
 barcode: string;
 @IsString()
 name: string;
 @IsNumber()
 price: number;
 @IsNumber()
 quantity: number;
 @IsString()
 expiryDate: string;
 @IsString()
 description: string;
 @IsString()
 @IsOptional()
 imageURL?: string;
 @IsNumber()
 minQuantity: number;
 @IsBoolean()
 isActive: boolean;
}
