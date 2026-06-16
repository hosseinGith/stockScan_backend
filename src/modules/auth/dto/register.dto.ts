import { IsString, Matches } from 'class-validator';
import { PASSWORD_PATTERN, USERNAME_PATTERN } from './login.dto';

// signup.dto.ts
export default class RegisterDto {
 @IsString()
 last_name: string;
 @IsString()
 first_name: string;
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
