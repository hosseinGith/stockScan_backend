import { PartialType } from '@nestjs/mapped-types';
import { UserDtoAdd } from './user-add.dto';

export default class UserUpdateDto extends PartialType(UserDtoAdd) {}
