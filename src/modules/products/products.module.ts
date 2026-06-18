import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Products } from './entities/products.entity';
import { CategoriesModule } from '../categories/categories.module';
import { UsersModule } from '../users/users.module';
import { FilesModule } from '../files/files.module';

@Module({
 imports: [
  TypeOrmModule.forFeature([Products]),
  CategoriesModule,
  UsersModule,
  FilesModule,
 ],

 controllers: [ProductsController],
 providers: [ProductsService],
 exports: [ProductsService],
})
export class ProductsModule {}
