import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Products } from './entities/products.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
 Between,
 FindManyOptions,
 FindOneOptions,
 FindOptionsWhere,
 Like,
 Repository,
} from 'typeorm';
import { CategoriesService } from '../categories/categories.service';
import {
 FilterProductsDto,
 ProductStatus,
 SortBy,
} from './dto/filter-products.dto';
import { ProductResponseDto } from './dto/product-response.dto';

@Injectable()
export class ProductsService {
 constructor(
  @InjectRepository(Products)
  private readonly products: Repository<Products>,
  private readonly categories: CategoriesService,
 ) {}

 async filterProducts(filterDto: FilterProductsDto, userId?: string) {
  const {
   search,
   categoryId,
   minPrice,
   maxPrice,
   sortBy,
   status,
   inStock,
   limit = 20,
   offset = 0,
  } = filterDto;

  const where: FindOptionsWhere<Products> = {
   isActive: true,
   creator: userId ? { id: userId } : undefined,
   category: categoryId ? { id: categoryId } : undefined,
  };
  if (search) {
   where.name = Like(`%${search}%`);
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
   where.price = Between(minPrice || 0, maxPrice || 999999999);
  }

  let queryBuilder = this.products
   .createQueryBuilder('product')
   .leftJoinAndSelect('product.category', 'category')
   .where('product.isActive = :isActive', { isActive: true });

  if (userId) {
   queryBuilder = queryBuilder
    .leftJoin('product.creator', 'creator')
    .andWhere('creator.id = :userId', { userId });
  }

  if (search) {
   queryBuilder = queryBuilder.andWhere(
    '(product.name LIKE :search OR product.barcode LIKE :search)',
    { search: `%${search}%` },
   );
  }

  if (categoryId) {
   queryBuilder = queryBuilder
    .leftJoin('product.creator', 'creator')
    .andWhere('creator.id = :categoryId', {
     categoryId,
    });
  }

  if (minPrice !== undefined) {
   queryBuilder = queryBuilder.andWhere('product.price >= :minPrice', {
    minPrice,
   });
  }
  if (maxPrice !== undefined) {
   queryBuilder = queryBuilder.andWhere('product.price <= :maxPrice', {
    maxPrice,
   });
  }

  const now = new Date();
  const nextWeek = new Date(now);
  nextWeek.setDate(now.getDate() + 7);

  if (status === ProductStatus.AVAILABLE) {
   queryBuilder = queryBuilder.andWhere(
    '(product.expiryDate IS NULL OR product.expiryDate >= :now)',
    { now: now.toISOString().split('T')[0] },
   );
  } else if (status === ProductStatus.EXPIRING_SOON) {
   queryBuilder = queryBuilder.andWhere(
    'product.expiryDate >= :now AND product.expiryDate <= :nextWeek',
    {
     now: now.toISOString().split('T')[0],
     nextWeek: nextWeek.toISOString().split('T')[0],
    },
   );
  } else if (status === ProductStatus.EXPIRED) {
   queryBuilder = queryBuilder.andWhere(
    'product.expiryDate IS NOT NULL AND product.expiryDate < :now',
    { now: now.toISOString().split('T')[0] },
   );
  }

  if (inStock) {
   queryBuilder = queryBuilder.andWhere('product.quantity > 0');
  }

  switch (sortBy) {
   case SortBy.NAME:
    queryBuilder = queryBuilder.orderBy('product.name', 'ASC');
    break;
   case SortBy.PRICE_ASC:
    queryBuilder = queryBuilder.orderBy('product.price', 'ASC');
    break;
   case SortBy.PRICE_DESC:
    queryBuilder = queryBuilder.orderBy('product.price', 'DESC');
    break;
   case SortBy.NEWEST:
    queryBuilder = queryBuilder.orderBy('product.createdAt', 'DESC');
    break;
   default:
    queryBuilder = queryBuilder.orderBy('product.name', 'ASC');
  }

  queryBuilder = queryBuilder.skip(offset).take(limit);

  const [products, total] = await queryBuilder.getManyAndCount();

  const data = products.map((product) => new ProductResponseDto(product));

  const allProducts = await this.products.find({
   where: userId
    ? { creator: { id: userId }, isActive: true }
    : { isActive: true },
  });

  const stats = {
   totalValue: allProducts.reduce((sum, p) => sum + p.price * p.quantity, 0),
   expiredCount: allProducts.filter((p) => {
    if (!p.expiryDate) return false;
    return new Date(p.expiryDate) < now;
   }).length,
   expiringSoonCount: allProducts.filter((p) => {
    if (!p.expiryDate) return false;
    const expiry = new Date(p.expiryDate);
    return expiry >= now && expiry <= nextWeek;
   }).length,
  };

  return {
   data,
   total,
   limit,
   offset,
   hasMore: offset + limit < total,
   stats,
  };
 }
 /**
  * this method create and update a product
  * @param createProductDto
  *
  * @returns
  */
 async create(createProductDto: CreateProductDto) {
  const isExistingProduct = await this.products.findOneBy({
   id: createProductDto.barcode,
  });
  if (isExistingProduct) {
   const updateStatus = await this.update(
    isExistingProduct.id,
    createProductDto,
   );
   return updateStatus;
  }
  const category = await this.categories.findOrCreate(
   {
    where: { name: createProductDto.category },
   },
   { name: createProductDto.category },
  );
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
  const category = await this.categories.findOrCreate(
   {
    where: { name: updateProductDto.category },
   },
   { name: updateProductDto.category },
  );
  const updateStatus = await this.products.update(id, {
   ...updateProductDto,
   category,
  });
  return updateStatus.affected;
 }

 async remove(id: string) {
  await this.products.delete(id);
  return { message: 'کالا حذف شد.' };
 }
}
