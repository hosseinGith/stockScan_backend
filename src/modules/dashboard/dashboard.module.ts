import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Products } from '../products/entities/products.entity';
import { Category } from '../categories/entities/category.entity';
import { UsersModule } from '../users/users.module';

@Module({
 imports: [TypeOrmModule.forFeature([Products, Category]), UsersModule],
 controllers: [DashboardController],
 providers: [DashboardService],
})
export class DashboardModule {}
