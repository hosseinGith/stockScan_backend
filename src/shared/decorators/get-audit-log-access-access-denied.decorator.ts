import { SetMetadata } from '@nestjs/common';

const GetAuditLogAccessDenied = () => SetMetadata('getAuditLog', true);
export default GetAuditLogAccessDenied;
