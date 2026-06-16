import {
 CanActivate,
 ExecutionContext,
 ForbiddenException,
 Injectable,
 UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UsersService } from 'src/modules/users/users.service';
import { TokenType } from 'src/types';

@Injectable()
export class AuthGuard implements CanActivate {
 constructor(
  private readonly jwtService: JwtService,
  private readonly users: UsersService,
  private readonly reflector: Reflector,
 ) {}
 async canActivate(context: ExecutionContext): Promise<boolean> {
  const request = context.switchToHttp().getRequest<Request>();
  const skipAuth = this.reflector?.get<boolean>(
   'skip-auth',
   context.getHandler(),
  );
  if (skipAuth) return true;

  const token = String(request.headers?.authorization).split(' ')[1];
  if (!token) throw new UnauthorizedException();
  console.log(token);
  let userData: TokenType;
  try {
   // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
   userData = (await this.jwtService.verify(token)) as TokenType;
  } catch {
   throw new UnauthorizedException();
  }

  if (userData?.id) {
   const user = await this.users.findOne(
    userData?.id,
    undefined,
    undefined,
    false,
   );
   if (!user) throw new UnauthorizedException();

   if (!user?.is_active)
    throw new ForbiddenException(
     'اکانت شما فعال نشده است. تا فعال شدن آن منتظر بمونید.',
    );
   request['userAccess'] = user?.role || '';
   request.user = user;

   return true;
  }
 }
}
