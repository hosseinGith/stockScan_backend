import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Products } from './entities/products.entity';
import { CategoriesModule } from '../categories/categories.module';

@Module({
 imports: [TypeOrmModule.forFeature([Products]), CategoriesModule],

 controllers: [ProductsController],
 providers: [ProductsService],
})
export class ProductsModule {}
