import { forwardRef, Module } from '@nestjs/common';
import { AuditLogsController } from './auditLogs.controller';
import { AuditLogsService } from './auditLogs.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogs } from 'src/modules/auditLogs/entities/auditLogs.entity';
import { UsersModule } from '../users/users.module';

@Module({
 imports: [
  TypeOrmModule.forFeature([AuditLogs]),
  forwardRef(() => UsersModule),
 ],
 controllers: [AuditLogsController],
 providers: [AuditLogsService],
 exports: [AuditLogsService],
})
export class AuditLogsModule {}
