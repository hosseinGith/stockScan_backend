import { AuditLogsActionEnum } from 'src/modules/auditLogs/entities/auditLogs.entity';

function getAuditLogAction(method: string): AuditLogsActionEnum {
 switch (method) {
  case 'GET':
   return AuditLogsActionEnum.VIEW;
  case 'POST':
   return AuditLogsActionEnum.CREATE;
  case 'PATCH':
   return AuditLogsActionEnum.UPDATE;
  case 'DELETE':
   return AuditLogsActionEnum.DELETE;
 }
}
export default getAuditLogAction;
