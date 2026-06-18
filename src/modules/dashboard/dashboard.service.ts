import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Category } from '../categories/entities/category.entity';
import { Products } from '../products/entities/products.entity';
import { ProductsService } from '../products/products.service';

@Injectable()
export class DashboardService {
 constructor(
  @InjectRepository(Products)
  private productRepository: Repository<Products>,
  @InjectRepository(Category)
  private categoryRepository: Repository<Category>,
  private products: ProductsService,
 ) {}

 async getStats() {
  const {
   expiredProductsCount,
   expiringSoonProductsCount,
   productsCount,
   totalPrice,
  } = await this.products.getStats();
  return {
   productsCount,
   totalPrice,
   expiredProductsCount,
   expiringSoonProductsCount,
   categoriesCount: await this.categoryRepository.count(),
  };
 }

 async getRecentProducts(limit: number = 5) {
  return this.productRepository.find({
   where: { isActive: true },
   relations: ['category'],
   order: { createdAt: 'DESC' },
   take: limit,
  });
 }

 async getExpiringProducts(limit: number = 10) {
  const now = new Date();
  const nextWeek = new Date(now);
  nextWeek.setDate(now.getDate() + 7);

  return this.productRepository.find({
   where: {
    isActive: true,
    expiryDate: Between(
     now.toISOString().split('T')[0],
     nextWeek.toISOString().split('T')[0],
    ),
   },
   relations: ['category'],
   order: { expiryDate: 'ASC' },
   take: limit,
  });
 }

 async getLowStockProducts(limit: number = 10) {
  const products = await this.productRepository.find({
   where: { isActive: true },
   relations: ['category'],
   order: { quantity: 'ASC' },
  });

  return products
   .filter((p) => p.quantity <= (p.minQuantity || 5))
   .slice(0, limit);
 }

 async getOverview() {
  const [stats, recentProducts, expiringProducts, lowStockProducts] =
   await Promise.all([
    this.getStats(),
    this.getRecentProducts(),
    this.getExpiringProducts(),
    this.getLowStockProducts(),
   ]);

  return {
   stats,
   recentProducts,
   expiringProducts,
   lowStockProducts,
  };
 }
}
