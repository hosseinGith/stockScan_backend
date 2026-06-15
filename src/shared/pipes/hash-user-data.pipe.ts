/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, PipeTransform } from '@nestjs/common';

import { hashedUserCol } from '../settings';
import { CryptoService } from 'src/modules/crypto/crypto.service';

@Injectable()
export class HashUserData implements PipeTransform {
 constructor(private readonly cryptoService: CryptoService) {}
 transform(value: any) {
  if (!value || typeof value !== 'object') return value;
  return this.deepSearchAndEncrypt(value, hashedUserCol);
 }

 deepSearchAndEncrypt(data: any, hashedCol: string[]): any {
  if (Array.isArray(data)) {
   return data.map((item) => this.deepSearchAndEncrypt(item, hashedCol));
  }
  if (data) {
   const result = { ...data };

   for (const [key, value] of Object.entries(result)) {
    try {
     if (typeof value === 'string' && hashedCol.includes(key)) {
      result[key] = this.cryptoService.encrypt(value);
     } else if (
      typeof value === 'object' &&
      value !== null &&
      !('getTime' in value)
     ) {
      result[key] = this.deepSearchAndEncrypt(value, hashedCol);
     }
    } catch {
     /* empty */
     result[key] = value;
    }
   }

   return result;
  }

  return data;
 }
}
