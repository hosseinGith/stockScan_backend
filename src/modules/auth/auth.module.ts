import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { OtpCodes } from './entities/otpCodes.entity';
import { UsersModule } from '../users/users.module';
import { CryptoService } from '../crypto/crypto.service';

@Module({
 imports: [TypeOrmModule.forFeature([OtpCodes]), forwardRef(() => UsersModule)],
 controllers: [AuthController],
 providers: [AuthService, CryptoService],
 exports: [AuthService],
})
export class AuthModule {}
