import { Injectable } from '@nestjs/common';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CategoriesService {
 constructor(
  @InjectRepository(Category)
  private readonly categories: Repository<Category>,
 ) {}
 async create(createCategoryDto: CreateCategoryDto) {
  const isExistingCategory = await this.categories.findOneBy({
   id: createCategoryDto.barcode,
  });
  // update if existing
  if (isExistingCategory) {
   const updateStatus = await this.categories.update(
    isExistingCategory.id,
    createCategoryDto,
   );
   return updateStatus;
  }
  // create
  const product = this.categories.create(createCategoryDto);
  await this.categories.save(product);
  return product;
 }

 async findAll(options?: FindManyOptions<Categories>) {
  const product = await this.categories.find(options);
  if (!product) throw new NotFoundException();
  return product;
 }

 async findOne(options?: FindOneOptions<Categories>) {
  const product = await this.categories.findOne(options);
  if (!product) throw new NotFoundException();
  return product;
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
