// ابتدا یک decorator سفارشی بسازید
// access.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/modules/users/types';

export const Access = (...Roles: Role[]) =>
 SetMetadata('Roles', Roles);
