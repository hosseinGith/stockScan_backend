import {
 Injectable,
 NotFoundException,
 UnauthorizedException,
 ServiceUnavailableException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OtpCodes } from './entities/otpCodes.entity';

import { Response } from 'express';
import { TokenType } from 'src/types';
import { UsersService } from '../users/users.service';
import { CryptoService } from '../crypto/crypto.service';

@Injectable()
export class AuthService {
 constructor(
  private readonly users: UsersService,
  @InjectRepository(OtpCodes)
  private readonly otpCodes: Repository<OtpCodes>,
  private readonly jwtService: JwtService,
  private readonly cryptoHash: CryptoService,
 ) {}
 createTokens(tokenConfig: any, response: Response) {
  try {
   const new_refresh_token = this.jwtService.sign(tokenConfig, {
    secret: process.env.JWT_SECRET,
   });
   const new_access_token = this.jwtService.sign(tokenConfig);

   response.cookie('refresh_token', new_refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
   });
   return new_access_token;
  } catch {
   throw new ServiceUnavailableException(
    'مشکل در احراز هویت. لطفا دوباره تلاش کنید.',
   );
  }
 }
 signup() {}
 signin() {}
 async refreshToken(user_refresh_token: string) {
  if (!user_refresh_token) throw new UnauthorizedException();
  try {
   this.jwtService.verify(user_refresh_token, {
    secret: process.env.JWT_SECRET,
   });
   const de_user: TokenType = this.jwtService.decode(user_refresh_token);
   const id = de_user?.id;
   const user = await this.users.findOne(id);
   if (!user) throw new NotFoundException();
   return { userId: user.id };
  } catch {
   throw new UnauthorizedException();
  }
 }
}
