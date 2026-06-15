import { OmitType } from '@nestjs/swagger';
import { AuditLogs } from 'src/modules/auditLogs/entities/auditLogs.entity';

export default class AuditLogsCreateDto extends OmitType(AuditLogs, [
 'id',
 'createdAt',
]) {}
