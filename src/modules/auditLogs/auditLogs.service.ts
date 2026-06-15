import { Injectable, NotFoundException } from '@nestjs/common';

import { Repository } from 'typeorm';
import {
 AuditLogs,
 AuditLogsActionEnum,
 AuditLogsTargetTypeEnum,
} from 'src/modules/auditLogs/entities/auditLogs.entity';
import { InjectRepository } from '@nestjs/typeorm';
import AuditLogsCreateDto from './dto/create.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuditLogsService {
 constructor(
  @InjectRepository(AuditLogs)
  private readonly AuditLogsRep: Repository<AuditLogs>,
  private readonly users: UsersService,
 ) {}
 async findOne(id: string) {
  const AuditLogsRep = await this.AuditLogsRep.findOneBy({
   id,
  });
  if (!AuditLogsRep) throw new NotFoundException();
  return AuditLogsRep;
 }
 async findAll() {
  return await this.AuditLogsRep.find();
 }
 async createAuditLog(
  action: AuditLogsActionEnum,
  ipAddress: string,
  userId: string,
  targetType: AuditLogsTargetTypeEnum,
  userAgent?: string,
  description?: string,
  newValue?: string,
  oldValue?: string,
  targetId?: string,
 ) {
  const target = await this.users.findOneByWhere({
   id: userId,
  });
  void this.create({
   action,
   ipAddress,
   user: target,
   targetType,
   userAgent,
   description,
   newValue,
   oldValue,
   targetId,
  });
 }
 async create(body: AuditLogsCreateDto) {
  const create_status = this.AuditLogsRep.create({
   ...body,
  });
  const auditLogsMedicalRep = await this.AuditLogsRep.save(create_status);
  return auditLogsMedicalRep;
 }
}
