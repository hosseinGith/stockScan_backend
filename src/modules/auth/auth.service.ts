import {
 Injectable,
 NotFoundException,
 UnauthorizedException,
 ServiceUnavailableException,
 BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OtpCodes } from './entities/otpCodes.entity';

import { Response } from 'express';
import { TokenType } from 'src/types';
import { UsersService } from '../users/users.service';
import { CryptoService } from '../crypto/crypto.service';
import LoginDto from './dto/login.dto';
import RegisterDto from './dto/register.dto';

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
    secure: process.env.NODE_ENV !== 'dev',
    sameSite: 'strict',
    maxAge: 7 * 10 ** 10,
   });
   return new_access_token;
  } catch {
   throw new ServiceUnavailableException(
    'مشکل در احراز هویت. لطفا دوباره تلاش کنید.',
   );
  }
 }
 async login(body: LoginDto) {
  const user = await this.users.findOneByWhere({
   username_hashed: this.cryptoHash.hashForSearch(
    this.cryptoHash.decrypt(body.username),
   ),
  });
  if (!user) {
   throw new BadRequestException('کاربر مورد نظر پیدا نشد.');
  }
  if (!(await this.cryptoHash.comparePassword(body.password, user.password)))
   throw new BadRequestException('نام کاربری یا رمز عبور اشتباه است.');
  return user;
 }
 async register(body: RegisterDto) {
    
  const user = await this.users.register(body);
  return user;
 }
 logout() {}
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
