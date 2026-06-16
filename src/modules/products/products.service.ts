import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Products } from './entities/products.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';

@Injectable()
export class ProductsService {
 constructor(
  @InjectRepository(Products)
  private readonly products: Repository<Products>,
 ) {}
 async create(createProductDto: CreateProductDto) {
  const isExistingProduct = await this.products.findOneBy({
   id: createProductDto.barcode,
  });
  // update if existing
  if (isExistingProduct) {
   const updateStatus = await this.products.update(
    isExistingProduct.id,
    createProductDto,
   );
   return updateStatus;
  }
  // create
  const product = this.products.create(createProductDto);
  await this.products.save(product);
  return product;
 }

 async findAll(options?: FindManyOptions<Products>) {
  const product = await this.products.find(options);
  if (!product) throw new NotFoundException();
  return product;
 }

 async findOne(options?: FindOneOptions<Products>) {
  const product = await this.products.findOne(options);
  if (!product) throw new NotFoundException();
  return product;
 }

 async update(id: string, updateProductDto: UpdateProductDto) {
  const updateStatus = await this.products.update(id, updateProductDto);
  return updateStatus.affected;
 }

 async remove(id: string) {
  await this.products.delete(id);
  return { message: 'کالا حذف شد.' };
 }
}
