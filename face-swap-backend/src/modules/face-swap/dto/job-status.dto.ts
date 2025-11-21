export enum JobStatus {
  QUEUED = 'queued',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface JobProgress {
  stage: string;
  percentage: number;
  currentFrame?: number;
  totalFrames?: number;
}

export class JobStatusResponseDto {
  jobId!: string;
  status!: JobStatus;
  progress?: JobProgress;
  error?: string;
  videoUrl?: string;
  createdAt!: Date;
  completedAt?: Date;
}

