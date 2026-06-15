import {
 CanActivate,
 ExecutionContext,
 ForbiddenException,
 Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Role } from 'src/modules/users/types';

@Injectable()
export class AccessGuard implements CanActivate {
 constructor(private readonly reflector: Reflector) {}

 canActivate(context: ExecutionContext): boolean {
  const requiredAccess = this.reflector.getAllAndOverride<Role[]>(
   'Roles',
   [context.getHandler(), context.getClass()],
  );
  const skipAuth = this.reflector?.get<boolean>(
   'skip-auth',
   context.getHandler(),
  );

  const request = context.switchToHttp().getRequest<Request>();
  const userAccess = request.userAccess as Role;

  if (
   userAccess === Role.ADMIN ||
   requiredAccess.includes(userAccess as Role) ||
   skipAuth
  )
   return true;

  throw new ForbiddenException();
 }
}
