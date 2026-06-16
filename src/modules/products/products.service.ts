import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Products } from './entities/products.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class ProductsService {
 constructor(
  @InjectRepository(Products)
  private readonly products: Repository<Products>,
  private readonly categories: CategoriesService,
 ) {}
 /**
  * this method create and update a product
  * @param createProductDto
  *
  * @returns
  */
 async create(createProductDto: CreateProductDto) {
  const category = await this.categories.findOrCreate(
   {
    where: { name: createProductDto.category },
   },
   { name: createProductDto.category },
  );
  const isExistingProduct = await this.products.findOneBy({
   id: createProductDto.barcode,
  });
  // update if existing
  if (isExistingProduct) {
   const updateStatus = await this.products.update(isExistingProduct.id, {
    ...createProductDto,
    category,
   });
   return updateStatus;
  }
  // create
  const product = this.products.create({ ...createProductDto, category });
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
