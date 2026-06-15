import {
 Entity,
 PrimaryColumn,
 Column,
 CreateDateColumn,
 ManyToOne,
 BeforeInsert,
} from 'typeorm';

import { Users } from '../../users/entities/users.entity';
export enum AuditLogsActionEnum {
 CREATE = 'create',
 UPDATE = 'update',
 DELETE = 'delete',
 VIEW = 'view',
 ACCESS_DENIED = 'access_denied',
}
export enum AuditLogsTargetTypeEnum {
 ADMIN = 'admin',
 UNKNOWN = 'unknown',
}
@Entity('audit_logs')
export class AuditLogs {
 @PrimaryColumn()
 id: string;
 @BeforeInsert()
 private async generateId() {
  const { nanoid } = await import('nanoid');
  this.id = nanoid();
 }
 @ManyToOne(() => Users)
 user!: Users;
 @Column({ nullable: true })
 targetId?: string;

 @Column({ type: 'enum', enum: AuditLogsTargetTypeEnum })
 targetType: AuditLogsTargetTypeEnum;

 @Column({ type: 'enum', enum: AuditLogsActionEnum })
 action: AuditLogsActionEnum;

 @Column({ type: 'text', nullable: true })
 oldValue?: string;
 @Column({ type: 'text', nullable: true })
 newValue?: string;
 @Column({ nullable: true })
 ipAddress?: string;
 @Column({ nullable: true })
 userAgent?: string;
 @Column({ nullable: true })
 description?: string;

 @CreateDateColumn()
 createdAt: Date;
}
