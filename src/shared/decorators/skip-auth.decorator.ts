import { SetMetadata } from '@nestjs/common';

const SkipAuth = () => SetMetadata('skip-auth', true);
export default SkipAuth;
