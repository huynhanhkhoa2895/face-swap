import { Injectable, Logger } from '@nestjs/common';
import { UserIdentifier, GenerationRecord, QuotaStatus } from './types/tracking.types';

@Injectable()
export class UserTrackingService {
  private readonly logger = new Logger(UserTrackingService.name);
  private readonly quotaMap = new Map<string, GenerationRecord>();
  private readonly maxGenerations = 1;
  private readonly quotaExpirationHours = 24;

  constructor() {
    // Cleanup expired records every hour
    setInterval(
      () => {
        this.cleanupExpiredRecords();
      },
      60 * 60 * 1000,
    );
  }

  private cleanupExpiredRecords(): void {
    const now = new Date();
    let cleaned = 0;
    for (const [key, record] of this.quotaMap.entries()) {
      if (now > record.expiresAt) {
        this.quotaMap.delete(key);
        cleaned++;
      }
    }
    if (cleaned > 0) {
      this.logger.log(`Cleaned up ${cleaned} expired quota records`);
    }
  }

  async checkQuota(identifier: UserIdentifier): Promise<QuotaStatus> {
    const key = this.getUserKey(identifier);
    const record = this.quotaMap.get(key);

    if (!record) {
      return {
        hasQuota: true,
        remainingGenerations: this.maxGenerations,
        maxGenerations: this.maxGenerations,
      };
    }

    const now = new Date();
    const expiresAt = new Date(record.expiresAt);

    if (now > expiresAt) {
      // Quota expired, remove record
      this.quotaMap.delete(key);
      return {
        hasQuota: true,
        remainingGenerations: this.maxGenerations,
        maxGenerations: this.maxGenerations,
      };
    }

    return {
      hasQuota: false,
      remainingGenerations: 0,
      maxGenerations: this.maxGenerations,
      resetAt: expiresAt,
    };
  }

  async recordGeneration(identifier: UserIdentifier, templateId: string): Promise<void> {
    const key = this.getUserKey(identifier);
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setHours(expiresAt.getHours() + this.quotaExpirationHours);

    const record: GenerationRecord = {
      identifier: key,
      timestamp: now,
      templateId,
      expiresAt,
    };

    this.quotaMap.set(key, record);
    this.logger.log(`Recorded generation for user: ${key}`);
  }

  private getUserKey(identifier: UserIdentifier): string {
    const parts = [identifier.ip, identifier.userAgent];
    if (identifier.fingerprint) {
      parts.push(identifier.fingerprint);
    }
    return `user:${parts.join(':')}`;
  }

  async getUserIdentifier(req: {
    ip?: string;
    headers: { [key: string]: string | string[] | undefined };
  }): Promise<UserIdentifier> {
    const ip = req.ip || 'unknown';
    const userAgent = (req.headers['user-agent'] as string) || 'unknown';
    const fingerprint = req.headers['x-fingerprint'] as string | undefined;

    return {
      ip,
      userAgent,
      fingerprint,
    };
  }
}
