import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ConvertNumberPersionToNumberLatinPipe implements PipeTransform {
 transform(value: any) {
  if (typeof value !== 'string') {
   // eslint-disable-next-line @typescript-eslint/no-unsafe-return
   return value;
  }

  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  // روش اول: با replace و map
  let result = value;
  persianNumbers.forEach((persian, index) => {
   const regex = new RegExp(persian, 'g');
   result = result.replace(regex, englishNumbers[index]);
  });

  return result;
 }
}
