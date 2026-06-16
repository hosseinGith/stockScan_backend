import { OmitType } from '@nestjs/swagger';
import { Products } from '../entities/products.entity';
import { IsString } from 'class-validator';

export class CreateProductDto extends OmitType(Products, [
 'id',
 'createdAt',
 'creator',
 'isExpired',
 'isExpiringSoon',
 'isLowStock',
 'totalValue',
 'category',
]) {
 @IsString()
 category?: string;
}
