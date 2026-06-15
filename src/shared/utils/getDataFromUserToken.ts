import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { TokenType } from 'src/types';

export default function getDataFromUserToken(
 request: Request,
): TokenType | undefined {
 const token = String(request.headers?.authorization).split(' ')[1];
 if (!token) throw new UnauthorizedException();

 // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
 const de_user = new JwtService().decode(String(token));
 // eslint-disable-next-line @typescript-eslint/no-unsafe-return
 return de_user;
}
