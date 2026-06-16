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

dotenv.config();
@Module({
 imports: [
  ThrottlerModule.forRoot([
   {
    ttl: 60 * 1000,
    limit: 20,
   },
  ]),

  JwtModule.register({ secret: process.env?.JWT_secret, global: true }),
  TypeOrmModule.forRoot({
   type: 'mysql',
   host: process.env?.db_host,
   port: 3306,
   username: process.env?.db_user,
   password: process.env?.db_password,
   database: process.env?.db_database,
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
 ],
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
