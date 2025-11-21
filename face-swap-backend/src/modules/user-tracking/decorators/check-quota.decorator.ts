import { SetMetadata } from '@nestjs/common';

export const CHECK_QUOTA_KEY = 'checkQuota';
export const CheckQuota = () => SetMetadata(CHECK_QUOTA_KEY, true);

