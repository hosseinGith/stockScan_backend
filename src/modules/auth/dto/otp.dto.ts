import { IsString, Matches } from 'class-validator';
import { numberPattern } from 'src/shared/utils';

export default class OtpDto {
 @IsString()
 @Matches(numberPattern, { message: 'فرمت شماره موبایل اشتباه است' })
 number: string;
}
