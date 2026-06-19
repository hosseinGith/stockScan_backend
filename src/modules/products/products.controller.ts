import {
 Controller,
 Get,
 Post,
 Body,
 Patch,
 Param,
 Delete,
 Query,
 ValidationPipe,
 UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductsDto } from './dto/filter-products.dto';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AccessGuard } from 'src/shared/guards/access.guard';
import { Access } from 'src/shared/decorators/access.decorator';
import { Role } from '../users/types';
import SkipAuth from 'src/shared/decorators/skip-auth.decorator';

@Controller('api/products')
@ApiBearerAuth()
@Access(Role.ADMIN)
@UseGuards(AuthGuard, AccessGuard)
export class ProductsController {
 constructor(private readonly productsService: ProductsService) {}

 @Get('search')
 async search(@Query(ValidationPipe) filterDto: FilterProductsDto) {
  return this.productsService.filterProducts(filterDto);
 }
 @Get('stats')
 getStats() {
  return this.productsService.getStats();
 }

 @SkipAuth()
 @Get('getProductInfoFromWebByBarcode')
 getProductInfoFromWebByBarcode(@Query('barcode') barcode: string) {
  return this.productsService.getProductInfoFromWebByBarcode(barcode);
 }
 @Post()
 create(@Body() createProductDto: CreateProductDto) {
  return this.productsService.create(createProductDto);
 }

 @Get()
 findAll() {
  return this.productsService.findAll();
 }

 @Get(':id')
 findOne(@Param('id') id: string) {
  return this.productsService.findOne({
   where: { id },
   relations: ['category'],
  });
 }

 @Patch(':id')
 update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
  return this.productsService.update(id, updateProductDto);
 }

 @Delete(':id')
 remove(@Param('id') id: string) {
  return this.productsService.remove(id);
 }
}
