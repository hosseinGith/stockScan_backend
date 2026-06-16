import { PickType } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';
import { Users } from 'src/modules/users/entities/users.entity';
import { PASSWORD_PATTERN, USERNAME_PATTERN } from './login.dto';


// signup.dto.ts
export default class RegisterDto extends PickType(Users, ['email']) {
 @IsString()
 @Matches(USERNAME_PATTERN, {
  message: 'فرمت نام کاربری اشتباه است',
 })
 username: string;
 @IsString()
 @Matches(PASSWORD_PATTERN, {
  message: 'رمز عبور شما کوتاه است',
 })
 password: string;
}
