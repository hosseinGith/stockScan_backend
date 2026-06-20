import { Controller, Get, Next, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags } from '@nestjs/swagger';
import { join } from 'path';
import { NextFunction, Response } from 'express';

@Controller()
@ApiTags('main')
export class AppController {
 constructor(private readonly appService: AppService) {}

//  @Get('*')
//  serveReactApp(
//   @Req() req: Request,
//   @Res() res: Response,
//   @Next() next: NextFunction,
//  ) {
//   const url = req.url;

//   if (
//    url.startsWith('/api') ||
//    url.startsWith('/assets') ||
//    url.includes('stats.index') ||
//    url.includes('stats.json')
//   ) {
//    next();
//    return;
//   }

//   res.sendFile(join(__dirname, 'public', 'index.html'));
//  }
}
