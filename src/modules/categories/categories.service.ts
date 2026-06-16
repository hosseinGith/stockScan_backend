import {
 BadRequestException,
 Injectable,
 NotFoundException,
} from '@nestjs/common';
import { Category } from './entities/category.entity';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
 constructor(
  @InjectRepository(Category)
  private readonly categories: Repository<Category>,
 ) {}
 async create(createCategoryDto: CreateCategoryDto) {
  const isExistingCategory = await this.categories.findOneBy({
   name: createCategoryDto.name,
  });
  // update if existing
  if (isExistingCategory) {
   throw new BadRequestException('این دسته بندی استفاده شده است.');
  }
  // create
  const category = this.categories.create(createCategoryDto);
  await this.categories.save(category);
  return category;
 }

 async findAll(options?: FindManyOptions<Category>) {
  const category = await this.categories.find(options);
  if (!category) throw new NotFoundException();
  return category;
 }

 async findOne(options?: FindOneOptions<Category>) {
  const category = await this.categories.findOne(options);
  if (!category) throw new NotFoundException();
  return category;
 }
 async findOrCreate(
  options: FindOneOptions<Category>,
  createCategoryDto: CreateCategoryDto,
 ): Promise<Category> {
  try {
   return await this.findOne(options);
  } catch (error) {
   if (error instanceof NotFoundException) {
    return await this.create(createCategoryDto);
   }
   throw error;
  }
 }

 async update(id: string, updateCategoryDto: UpdateCategoryDto) {
  const updateStatus = await this.categories.update(id, updateCategoryDto);
  return updateStatus.affected;
 }

 async remove(id: string) {
  await this.categories.delete(id);
  return { message: 'کالا حذف شد.' };
 }
}
