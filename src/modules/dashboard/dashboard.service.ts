import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Category } from '../categories/entities/category.entity';
import { Products } from '../products/entities/products.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class DashboardService {
 constructor(
  @InjectRepository(Products)
  private productRepository: Repository<Products>,
  @InjectRepository(Category)
  private categoryRepository: Repository<Category>,
  private users: UsersService,
 ) {}

 async getStats(userId: string) {
  const user = await this.users.findOne(userId);
  const products = await this.productRepository.find({
   where: { creator: user, isActive: true },
  });

  const now = new Date();
  const nextWeek = new Date(now);
  nextWeek.setDate(now.getDate() + 7);

  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + p.price * p.quantity, 0);

  const expiredCount = products.filter((p) => {
   if (!p.expiryDate) return false;
   return new Date(p.expiryDate) < now;
  }).length;

  const expiringSoonCount = products.filter((p) => {
   if (!p.expiryDate) return false;
   const expiry = new Date(p.expiryDate);
   return expiry >= now && expiry <= nextWeek;
  }).length;

  const lowStockCount = products.filter(
   (p) => p.quantity <= (p.minQuantity || 5),
  ).length;

  return {
   totalProducts,
   totalValue,
   expiredCount,
   expiringSoonCount,
   lowStockCount,
   categoriesCount: await this.categoryRepository.count(),
  };
 }

 async getRecentProducts(userId: string, limit: number = 5) {
  const user = await this.users.findOne(userId);

  return this.productRepository.find({
   where: { creator: user, isActive: true },
   relations: ['category'],
   order: { createdAt: 'DESC' },
   take: limit,
  });
 }

 async getExpiringProducts(userId: string, limit: number = 10) {
  const user = await this.users.findOne(userId);

  const now = new Date();
  const nextWeek = new Date(now);
  nextWeek.setDate(now.getDate() + 7);

  return this.productRepository.find({
   where: {
    creator: user,
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

 async getLowStockProducts(userId: string, limit: number = 10) {
  const user = await this.users.findOne(userId);

  const products = await this.productRepository.find({
   where: { creator: user, isActive: true },
   relations: ['category'],
   order: { quantity: 'ASC' },
  });

  return products
   .filter((p) => p.quantity <= (p.minQuantity || 5))
   .slice(0, limit);
 }

 async getOverview(userId: string) {
  const [stats, recentProducts, expiringProducts, lowStockProducts] =
   await Promise.all([
    this.getStats(userId),
    this.getRecentProducts(userId),
    this.getExpiringProducts(userId),
    this.getLowStockProducts(userId),
   ]);

  return {
   stats,
   recentProducts,
   expiringProducts,
   lowStockProducts,
  };
 }
}
