import { OmitType } from '@nestjs/swagger';
import { Products } from '../entities/products.entity';

export class CreateProductDto extends OmitType(Products, [
 'id',
 'createdAt',
 'creator',
 'isExpired',
 'isExpiringSoon',
 'isLowStock',
 'totalValue',
]) {}
