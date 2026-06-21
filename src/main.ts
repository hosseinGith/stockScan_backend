import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AuditLogs } from './modules/auditLogs/entities/auditLogs.entity';
import { ConvertNumberPersionToNumberLatinPipe } from './shared/pipes/convert-number-persion-to-number-latin.pipe';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';

async function bootstrap() {
 const app = await NestFactory.create<NestExpressApplication>(AppModule);

 app.use(
  helmet({
   contentSecurityPolicy: {
    directives: {
     defaultSrc: ["'self'"],
     scriptSrc: ["'self'", "'wasm-unsafe-eval'"],
     scriptSrcAttr: ["'none'"],
     styleSrc: ["'self'", "'unsafe-inline'", 'https://cdnjs.cloudflare.com'],
     fontSrc: ["'self'", 'https:', 'data:'],
     imgSrc: ["'self'", 'data:', 'blob:'],
     mediaSrc: ["'self'", 'blob:'],
     connectSrc: [
      "'self'",
      'https://fastly.jsdelivr.net',
      'https://cdn.jsdelivr.net',
     ],
     workerSrc: ["'self'", 'blob:'],
     objectSrc: ["'none'"],
     baseUri: ["'self'"],
     formAction: ["'self'"],
     frameAncestors: ["'self'"],
     upgradeInsecureRequests: [],
    },
   },
  }),
 );

 // static files با هدر CSP
 app.use(
  express.static(join(process.cwd(), '..', 'public'), {
   setHeaders: (res) => {
    res.setHeader(
     'Content-Security-Policy',
     "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; font-src 'self' https: data:; img-src 'self' data: blob:; media-src 'self' blob:; connect-src 'self'; worker-src 'self' blob:; object-src 'none';",
    );
   },
  }),
 );

 // بقیه کد دست نخورده
 app.enableCors(
  process.env.NODE_ENV === 'dev'
   ? {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
      credentials: true,
      preflightContinue: false,
      optionsSuccessStatus: 204,
     }
   : undefined,
 );

 app.setGlobalPrefix('api');
 app.useGlobalPipes(
  new ConvertNumberPersionToNumberLatinPipe(),
  new ValidationPipe({
   transform: true,
   whitelist: true,
   forbidNonWhitelisted: true,
   transformOptions: { enableImplicitConversion: true },
  }),
 );

 const config = new DocumentBuilder()
  .setTitle('nest practice')
  .setDescription('API description')
  .setVersion('1.0')
  .addBearerAuth()
  .build();
 const document = SwaggerModule.createDocument(app, config, {
  extraModels: [AuditLogs],
 });
 SwaggerModule.setup('/documentation', app, document, {
  swaggerOptions: { persistAuthorization: true },
 });

 await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
