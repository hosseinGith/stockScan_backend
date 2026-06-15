import { Users } from '../modules/users/entities/users.entity';

declare global {
 namespace Express {
  interface Request {
   userAccess: string;
   user: Users;
  }
 }
}
