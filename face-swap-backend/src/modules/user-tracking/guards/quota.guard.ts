import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserTrackingService } from '../user-tracking.service';
import { CHECK_QUOTA_KEY } from '../decorators/check-quota.decorator';

@Injectable()
export class QuotaGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userTrackingService: UserTrackingService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const checkQuota = this.reflector.getAllAndOverride<boolean>(CHECK_QUOTA_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!checkQuota) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const identifier = await this.userTrackingService.getUserIdentifier(request);
    const quotaStatus = await this.userTrackingService.checkQuota(identifier);

    if (!quotaStatus.hasQuota) {
      throw new ForbiddenException(
        `Quota exceeded. You can generate ${quotaStatus.maxGenerations} video per day. Reset at: ${quotaStatus.resetAt?.toISOString()}`,
      );
    }

    return true;
  }
}

