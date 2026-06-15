import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import getIp from '../utils/getIp';

export const RealIp = createParamDecorator(
 (data: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest<Request>();
  return getIp(request);
 },
);
