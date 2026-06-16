import { IsString, Matches } from 'class-validator';
const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,30}$/;
const PASSWORD_PATTERN = /^.{5,}$/;

// signup.dto.ts
export default class LoginDto {
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
