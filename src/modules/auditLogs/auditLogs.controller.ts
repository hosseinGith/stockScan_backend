import { Controller, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { Access } from 'src/shared/decorators/access.decorator';
import { AccessGuard } from 'src/shared/guards/access.guard';
import { Role } from '../users/types';
@Controller('/api/auditLogsMedical')
@Access(Role.ADMIN)
@UseGuards(AuthGuard, AccessGuard)
@ApiBearerAuth()
export class AuditLogsController {}
