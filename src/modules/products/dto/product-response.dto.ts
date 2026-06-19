import { Category } from 'src/modules/categories/entities/category.entity';
import { Products } from '../entities/products.entity';

export class ProductResponseDto {
 id: string;
 barcode: string;
 name: string;
 price: number;
 quantity: number;
 expiryDate: string | null;
 description: string | null;
 imageUrl: string | null;
 categoryId: string | null;
 category: Category | null;
 categoryName?: string | null;
 createdAt: Date;
 updatedAt: Date;

 // فیلدهای محاسباتی
 isExpired?: boolean;
 isExpiringSoon?: boolean;
 totalValue?: number;

 constructor(product: Products) {
  this.id = product.id;
  this.barcode = product.barcode;
  this.name = product.name;
  this.price = product.price;
  this.quantity = product.quantity;
  this.expiryDate = product.expiryDate;
  this.description = product.description;
  this.categoryId = product.category.id || null;
  this.categoryName = product.category?.name || null;
  this.createdAt = product.createdAt;
  this.updatedAt = product.updatedAt;

  // محاسبه فیلدهای اضافی
  const now = new Date();
  if (product.expiryDate) {
   const expiry = new Date(product.expiryDate);
   this.isExpired = expiry < now;
   this.isExpiringSoon =
    expiry >= now &&
    expiry <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  } else {
   this.isExpired = false;
   this.isExpiringSoon = false;
  }
  this.totalValue = product.price * product.quantity;
 }
}

export class FilteredProductsResponseDto {
 data: ProductResponseDto[];
 total: number;
 limit: number;
 offset: number;
 hasMore: boolean;
 stats?: {
  totalValue: number;
  expiredCount: number;
  expiringSoonCount: number;
 };
}
