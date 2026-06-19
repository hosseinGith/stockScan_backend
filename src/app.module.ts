import 'reflect-metadata';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogsModule } from './modules/auditLogs/auditLogs.module';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import * as dotenv from 'dotenv';
import { AuthModule } from './modules/auth/auth.module';
import { CryptoModule } from './modules/crypto/crypto.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { FilesModule } from './modules/files/files.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { Request } from 'express';
dotenv.config();
@Module({
 imports: [
  ThrottlerModule.forRoot([
   {
    ttl: 60 * 1000,
    limit: 20,
    skipIf: (context) => {
     const req = context.switchToHttp().getRequest<Request>();
     const url = req.url;

     return (
      url.includes('.js') ||
      url.includes('.css') ||
      url.includes('.png') ||
      url.includes('.jpg') ||
      url.includes('.svg') ||
      url.includes('.ico') ||
      url.includes('.json') ||
      url.includes('stats.index') ||
      url.startsWith('/assets')
     );
    },
   },
  ]),

  JwtModule.register({ secret: process.env?.JWT_SECRET, global: true }),
  TypeOrmModule.forRoot({
   type: 'mysql',
   host: process.env?.DB_HOST,
   port: 3306,
   username: process.env?.DB_USER,
   password: process.env?.DB_PASSWORD,
   database: process.env?.DB_DATABASE,
   entities: [__dirname + '/**/*.entity{.ts,.js}'],
   namingStrategy: new SnakeNamingStrategy(),
   //    synchronize: true,
   //    dropSchema: true,
  }),

  AuthModule,
  UsersModule,
  AuditLogsModule,
  CryptoModule,
  ProductsModule,
  CategoriesModule,
  DashboardModule,
  FilesModule,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  ServeStaticModule.forRoot({
   rootPath: join(__dirname, 'public'),
   exclude: ['/api/*', '/assets/*', '*.json'],
  }) as any,
 ] as const,
 controllers: [AppController],
 providers: [
  AppService,
  {
   provide: APP_GUARD,
   useClass: ThrottlerGuard,
  },
 ],
})
export class AppModule {}
