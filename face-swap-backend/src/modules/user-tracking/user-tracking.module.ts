import { Module } from '@nestjs/common';
import { UserTrackingService } from './user-tracking.service';
import { QuotaGuard } from './guards/quota.guard';

@Module({
  providers: [UserTrackingService, QuotaGuard],
  exports: [UserTrackingService, QuotaGuard],
})
export class UserTrackingModule {}

