export interface UserIdentifier {
  ip: string;
  fingerprint?: string;
  userAgent: string;
}

export interface GenerationRecord {
  identifier: string;
  timestamp: Date;
  templateId: string;
  expiresAt: Date;
}

export interface QuotaStatus {
  hasQuota: boolean;
  remainingGenerations: number;
  maxGenerations: number;
  resetAt?: Date;
}

