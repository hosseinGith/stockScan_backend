import {
 Body,
 Controller,
 NotFoundException,
 Post,
 Req,
 Res,
 UsePipes,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import LoginDto from './dto/login.dto';
import { HashUserData } from '../../shared/pipes/hash-user-data.pipe';
import { type Request, type Response } from 'express';
import RegisterDto from './dto/register.dto';

@ApiTags('Authentication')
@Controller('/auth')
@UsePipes(HashUserData)
export class AuthController {
 constructor(private readonly authService: AuthService) {}
 @Post('/register')
 register(@Body() body: RegisterDto) {
  return this.authService.register(body);
 }

 @Post('/login')
 async login(
  @Body() body: LoginDto,
  @Res({ passthrough: true }) response: Response,
 ) {
  const user = await this.authService.login(body);
  const token = this.authService.createTokens({ id: user.id }, response);
  return { user, token };
 }
 @Post('/refresh-token')
 async refreshToken(
  @Req() request: Request,
  @Res({ passthrough: true }) response: Response,
 ) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const user_refresh_token = request.cookies['refresh_token'] as
   | string
   | undefined;
  if (!user_refresh_token) throw new NotFoundException();
  const { userId } = await this.authService.refreshToken(user_refresh_token);
  const token = this.authService.createTokens({ id: userId }, response);
  return token;
 }
}
