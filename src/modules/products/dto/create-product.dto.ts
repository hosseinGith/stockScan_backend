import { OmitType } from '@nestjs/swagger';
import { Products } from '../entities/products.entity';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

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
 imageUrl: string;
 @IsNumber()
 minQuantity: number;
 @IsBoolean()
 isActive: boolean;
}
