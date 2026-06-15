import { PartialType } from '@nestjs/mapped-types';
import { Users } from '../entities/users.entity';
import { PickType } from '@nestjs/swagger';
export default class UserUpdatePublicDto extends PartialType(
 PickType(Users, ['first_name', 'last_name']),
) {}
