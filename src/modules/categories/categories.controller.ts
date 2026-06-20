import {
 Controller,
 Get,
 Post,
 Body,
 Patch,
 Param,
 Delete,
 UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AccessGuard } from 'src/shared/guards/access.guard';
import { Access } from 'src/shared/decorators/access.decorator';
import { Role } from '../users/types';
import SkipAuth from 'src/shared/decorators/skip-auth.decorator';

@Controller('/categories')
@ApiBearerAuth()
@Access(Role.ADMIN)
@UseGuards(AuthGuard, AccessGuard)
export class CategoriesController {
 constructor(private readonly categoriesService: CategoriesService) {}

 @Post()
 create(@Body() createCategoryDto: CreateCategoryDto) {
  return this.categoriesService.create(createCategoryDto);
 }

 @SkipAuth()
 @Get()
 findAll() {
  return this.categoriesService.findAll();
 }

 @SkipAuth()
 @Get(':id')
 findOne(@Param('id') id: string) {
  return this.categoriesService.findOne({ where: { id } });
 }

 @Patch(':id')
 update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
  return this.categoriesService.update(id, updateCategoryDto);
 }

 @Delete(':id')
 remove(@Param('id') id: string) {
  return this.categoriesService.remove(id);
 }
}
