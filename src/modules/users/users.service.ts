import {
 BadRequestException,
 Injectable,
 InternalServerErrorException,
 NotFoundException,
 UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/modules/users/entities/users.entity';
import {
 FindOptionsRelationByString,
 FindOptionsRelations,
 FindOptionsSelect,
 FindOptionsSelectByString,
 FindOptionsWhere,
 Repository,
} from 'typeorm';
import { UserDtoAdd } from './dto/user-add.dto';
import UserUpdateDto from './dto/user-update.dto';
import UserUpdatePublicDto from './dto/user-update-public.dto';
import { CryptoService } from '../crypto/crypto.service';
import { Role } from './types';
@Injectable()
export class UsersService {
 constructor(
  @InjectRepository(Users)
  private readonly users: Repository<Users>,
  private readonly cryptoService: CryptoService,
 ) {}

 async findOne(
  id: string,
  relations?: FindOptionsRelations<Users> | FindOptionsRelationByString,
  select?: FindOptionsSelect<Users> | FindOptionsSelectByString<Users>,
  throwError = true,
 ) {
  const user = await this.users.findOne({
   where: { id },
   relations,
   select,
  });
  if (throwError && !user) throw new NotFoundException();
  return user;
 }
 async findOneByWhere(
  where: FindOptionsWhere<Users> | FindOptionsWhere<Users>[],
  relations?: FindOptionsRelationByString | FindOptionsRelations<Users>,
  select?: FindOptionsSelect<Users> | FindOptionsSelectByString<Users>,
 ): Promise<Users> {
  const res = await this.users.findOne({ where, relations, select });
  if (!res) throw new NotFoundException();
  return res;
 }
 async findAllByWhere(
  where?: FindOptionsWhere<Users> | FindOptionsWhere<Users>[],
  relations?: FindOptionsRelationByString | FindOptionsRelations<Users>,
  select?: FindOptionsSelect<Users> | FindOptionsSelectByString<Users>,
 ): Promise<Users[]> {
  const res = await this.users.find({ where, relations, select });
  return res;
 }

 async getProfile(id: string) {
  const userData = await this.users.findOne({
   where: { id },
  });
  if (!userData) throw new UnauthorizedException();
  return userData;
 }

 async create(body: UserDtoAdd) {
  const hashedNumber = this.cryptoService.hashForSearch(
   this.cryptoService.decrypt(body.number),
  );
  const existingUser = await this.users.findOne({
   where: { number_hash: hashedNumber },
  });

  if (existingUser) {
   throw new BadRequestException(
    'این نام کاربری استفاده شده است. لطفاً نام کاربری دیگری انتخاب کنید.',
   );
  }

  const is_active = body.role === Role.ADMIN;

  const queryRunner = this.users.manager.connection.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
   const user = queryRunner.manager.create(Users, {
    ...body,
    is_active,
    number_hash: this.cryptoService.hashForSearch(body.number),
   });
   const savedUser = await queryRunner.manager.save(Users, user);

   await queryRunner.commitTransaction();

   return {
    user: { ...savedUser, number: body.number, password: undefined },
   };
  } catch (e) {
   console.error(e);

   await queryRunner.rollbackTransaction();
   throw new BadRequestException('خطا در ثبت‌نام. لطفاً دوباره تلاش کنید.');
  } finally {
   await queryRunner.release();
  }
 }
 private async updateCheckUserData(
  id: string,
  body: {
   number?: string;
   national_id?: string;
  },
 ) {
  const hashedNumber = this.cryptoService.hashForSearch(
   this.cryptoService.decrypt(body?.number),
  );
  if (body?.number)
   if (await this.users.findOneBy({ number_hash: hashedNumber }))
    throw new BadRequestException(
     'این نام کاربری استفاده شده است. لطفاً نام کاربری دیگری انتخاب کنید.',
     'number',
    );

  if (body?.national_id)
   if (await this.users.findOneBy({ national_id: body.national_id }))
    throw new BadRequestException('این کد ملی استفاده شده است.', 'national_id');

  const user = await this.users.findOneBy({ id });
  const fieldsToUpdate = Object.keys(body).length;

  if (fieldsToUpdate === 0) {
   throw new BadRequestException('هیچ فیلدی برای به‌روزرسانی ارسال نشده است.');
  }
  return user;
 }
 async update(id: string, body: UserUpdateDto) {
  return (await this.users.update({ id }, body)).affected === 1;
 }
 async updateUserData(body: UserUpdatePublicDto, id: string) {
  const user = await this.updateCheckUserData(id, body);
  if (user)
   return (await this.users.update({ id: user.id }, body)).affected === 1;
  throw new NotFoundException();
 }
 async remove(id: string) {
  if (!id) throw new BadRequestException('id not found', 'id');

  const queryRunner = this.users.manager.connection.createQueryRunner();
  // get user with relations to check if it's doctor or patient and delete related data accordingly
  const user = await this.users.findOne({
   where: { id },
   relations: ['doctor', 'patient'],
  });

  if (!user) throw new NotFoundException();

  try {
   await queryRunner.connect();
   await queryRunner.startTransaction();

   await queryRunner.manager.delete('users', { id });
   await queryRunner.commitTransaction();

   return true;
  } catch {
   await queryRunner.rollbackTransaction();
   throw new InternalServerErrorException(); // ✅
  } finally {
   await queryRunner.release();
  }
 }
}
