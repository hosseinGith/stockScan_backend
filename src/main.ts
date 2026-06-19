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
 app.use(helmet());
 // eslint-disable-next-line @typescript-eslint/no-unsafe-call
 //  app.use(csrf());
 app.enableCors(
  process.env.NODE_ENV
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
 app.use(express.static(join(process.cwd(), 'public')));

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
  swaggerOptions: {
   persistAuthorization: true,
  },
 });
 await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
