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
 Req,
 UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductsDto } from './dto/filter-products.dto';
import { Request } from 'express';
import { AuthGuard } from 'src/shared/guards/auth.guard';

@Controller('api/products')
@UseGuards(AuthGuard)
export class ProductsController {
 constructor(private readonly productsService: ProductsService) {}

 @Get('search')
 async search(
  @Query(ValidationPipe) filterDto: FilterProductsDto,
  @Req() request: Request,
 ) {
  return this.productsService.filterProducts(filterDto, request.user.id);
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
  return this.productsService.findOne({ where: { id } });
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
