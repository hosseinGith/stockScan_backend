/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
 CallHandler,
 ExecutionContext,
 Injectable,
 InternalServerErrorException,
 NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { hashedUserCol } from '../settings';
import { CryptoService } from 'src/modules/crypto/crypto.service';

@Injectable()
export class DecryptUserData implements NestInterceptor {
 constructor(private readonly cryptoHash: CryptoService) {}
 intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
  return next.handle().pipe(
   map((data) => {
    try {
     // eslint-disable-next-line @typescript-eslint/no-unsafe-return
     return this.deepSearchAndDecrypt(data);
    } catch {
     throw new InternalServerErrorException('دوباره تلاش کنید.');
    }
   }),
  );
 }

 private deepSearchAndDecrypt(data: any): any {
  if (!data) return data;

  if (Array.isArray(data)) {
   // eslint-disable-next-line @typescript-eslint/no-unsafe-return
   return data.map((item) => this.deepSearchAndDecrypt(item));
  }

  if (typeof data === 'object' && data !== null) {
   // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
   const result = { ...data };

   for (const [key, value] of Object.entries(result)) {
    try {
     if (typeof value === 'string' && hashedUserCol.includes(key)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      result[key] = this.cryptoHash.decrypt(value);
     } else if (
      typeof value === 'object' &&
      value !== null &&
      !('getTime' in value)
     ) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      result[key] = this.deepSearchAndDecrypt(value);
     } else if (typeof value === 'string') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      result[key] = value;
     }
    } catch {
     /* empty */
    }
   }
   return result;
  }

  return data;
 }
}
