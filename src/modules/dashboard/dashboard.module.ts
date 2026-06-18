import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Products } from '../products/entities/products.entity';
import { Category } from '../categories/entities/category.entity';
import { UsersModule } from '../users/users.module';
import { CategoriesModule } from '../categories/categories.module';
import { ProductsModule } from '../products/products.module';

@Module({
 imports: [
  TypeOrmModule.forFeature([Products, Category]),
  UsersModule,
  CategoriesModule,
  ProductsModule,
 ],
 controllers: [DashboardController],
 providers: [DashboardService],
})
export class DashboardModule {}
