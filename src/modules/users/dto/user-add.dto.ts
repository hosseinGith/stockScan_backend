import { OmitType } from '@nestjs/swagger';
import { Users } from '../entities/users.entity';

export class UserDtoAdd extends OmitType(Users, [
 'id',
 'created_at',
 'number_hash',
 'national_id_hash',
]) {}
