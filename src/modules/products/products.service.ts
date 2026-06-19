import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Products } from './entities/products.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as cheerio from 'cheerio';

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
import { FilesService } from '../files/files.service';
import axios from 'node_modules/axios';

@Injectable()
export class ProductsService {
 constructor(
  @InjectRepository(Products)
  private readonly products: Repository<Products>,
  private readonly categories: CategoriesService,
  private readonly files: FilesService,
 ) {}

 async filterProducts(filterDto: FilterProductsDto) {
  const {
   search,
   category,
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
   category: category ? { name: category } : undefined,
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

  if (search) {
   queryBuilder = queryBuilder.andWhere(
    '(product.name LIKE :search OR product.barcode LIKE :search)',
    { search: `%${search}%` },
   );
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

  const stats = await this.getStats();

  return {
   data,
   total,
   limit,
   offset,
   hasMore: offset + limit < total,
   stats,
  };
 }
 async getStats() {
  const queryBuilder = this.products.createQueryBuilder('product');
  const now = new Date();
  const nextWeek = new Date(now);
  nextWeek.setDate(now.getDate() + 7);
  const [
   productsCount,
   productsByBarcodeCount,
   expiredProductsCount,
   expiringSoonProductsCount,
   totalPrice,
  ] = await Promise.all([
   this.products
    .createQueryBuilder('product')
    .select('SUM(product.quantity)', 'totalQuantity')
    .where('product.isActive = :isActive', { isActive: true })
    .andWhere('product.quantity > :quantity', { quantity: 1 })
    .getRawOne<{ totalQuantity: string }>(),
   this.products.count(),
   queryBuilder
    .where('(product.expiryDate IS NULL OR product.expiryDate >= :now)', {
     now: now.toISOString().split('T')[0],
    })
    .getCount(),
   queryBuilder
    .where('product.expiryDate >= :now AND product.expiryDate <= :nextWeek', {
     now: now.toISOString().split('T')[0],
     nextWeek: nextWeek.toISOString().split('T')[0],
    })
    .getCount(),
   this.products
    .createQueryBuilder('product')
    .select('SUM(product.price) * product.quantity', 'totalPrice')
    .where('product.isActive = :isActive', { isActive: true })
    .andWhere('product.quantity > :quantity', { quantity: 1 })
    .getRawOne<{ totalPrice: string }>(),
  ]);

  return {
   productsCount: Number(productsCount.totalQuantity || 0),
   productsByBarcodeCount,
   expiredProductsCount,
   expiringSoonProductsCount,
   totalPrice: Number(totalPrice.totalPrice || 0),
  };
 }
 /**
  * this method create and update a product
  * @param createProductDto
  *
  * @returns
  */
 async create(createProductDto: CreateProductDto) {
  const isExistingProduct = await this.products.findOne({
   where: {
    barcode: createProductDto.barcode,
   },
   select: ['id'],
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
  const imageInfo = createProductDto.imageURL
   ? await this.files.getFileInfo(createProductDto.imageURL)
   : null;

  const product = this.products.create({
   ...createProductDto,
   category,
   ...(imageInfo?.image ? { image: imageInfo.image } : {}),
  });
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
 private extractProductInfo(html: string) {
  const $ = cheerio.load(html);

  const productInfo = {
   description: '',
   brand: '',
   gpcStructure: '',
   break: '',
   breakCode: '',
   language: 'فارسی',
   codeType: 'GTIN 13',
   englishDescription: '',
   englishBrand: '',
  };

  $('.col-md-6:first-child ul li').each((i, el) => {
   const text = $(el).text().trim();

   if (text.includes('شرح برچسب:')) {
    productInfo.description = text.replace('شرح برچسب:', '').trim();
   } else if (text.includes('نام برند:')) {
    productInfo.brand = text.replace('نام برند:', '').trim();
   } else if (text.includes('ساختار GPC:')) {
    productInfo.gpcStructure = text.replace('ساختار GPC:', '').trim();
   } else if (text.includes('بریک:')) {
    productInfo.break = text.replace('بریک:', '').trim();
   } else if (text.includes('کد بریک:')) {
    productInfo.breakCode = text.replace('کد بریک:', '').trim();
   } else if (text.includes('نوع کد:')) {
    productInfo.codeType = text.replace('نوع کد:', '').trim();
   }
  });

  $('.col-md-6:last-child ul li').each((i, el) => {
   const text = $(el).text().trim();

   if (text.includes('Label Description:')) {
    productInfo.englishDescription = text
     .replace('Label Description:', '')
     .trim();
   } else if (text.includes('Brand Title:')) {
    productInfo.englishBrand = text.replace('Brand Title:', '').trim();
   }
  });
  for (const key in productInfo) {
   const item = productInfo[key as keyof typeof productInfo];
   productInfo[key as keyof typeof productInfo] = item.replace('کد','').replace(/\n/g,'').trim();
  }
  return productInfo;
 }

 async getProductInfoFromWebByBarcode(barcode: string) {
  const response = await axios.get(`https://www.irancode.ir/01/${barcode}`);
  const html = response.data as string;
  return this.extractProductInfo(html);
 }
 async update(id: string, updateProductDto: UpdateProductDto) {
  const [category, imageInfo] = await Promise.all([
   this.categories.findOrCreate(
    {
     where: { name: updateProductDto.category },
    },
    { name: updateProductDto.category },
   ),
   updateProductDto.imageURL
    ? this.files.getFileInfo(updateProductDto.imageURL)
    : null,
  ]);
  console.log(imageInfo);

  const updateStatus = await this.products.update(id, {
   ...updateProductDto,
   category,
   ...(imageInfo?.image ? { image: imageInfo.image } : {}),
  });
  return updateStatus.affected;
 }

 async remove(id: string) {
  await this.products.delete(id);
  return { message: 'کالا حذف شد.' };
 }
}
