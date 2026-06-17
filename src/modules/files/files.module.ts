import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileEntity } from './entities/file.entity';
import { UsersModule } from '../users/users.module';
import { CryptoModule } from '../crypto/crypto.module';

@Module({
 imports: [TypeOrmModule.forFeature([FileEntity]), CryptoModule, UsersModule],
 controllers: [FilesController],
 providers: [FilesService],
 exports: [FilesService],
})
export class FilesModule {}
