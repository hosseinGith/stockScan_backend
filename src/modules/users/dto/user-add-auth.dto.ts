import { PickType } from '@nestjs/swagger';
import { Users } from '../entities/users.entity';

export class UserDtoAddAuth extends PickType(Users, ['username', 'password']) {}
