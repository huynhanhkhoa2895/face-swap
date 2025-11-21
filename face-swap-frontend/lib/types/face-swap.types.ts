export enum CharacterType {
  COLLEAGUE = "colleague",
  BOSS = "boss",
  HOMIE = "homie",
}

export enum Gender {
  MALE = "male",
  FEMALE = "female",
}

export enum JobStatus {
  QUEUED = "queued",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
}

export interface Template {
  id: string;
  name: string;
  character: CharacterType;
  gender: Gender;
  thumbnailUrl: string;
  duration: number;
}

export interface JobProgress {
  stage: string;
  percentage: number;
  currentFrame?: number;
  totalFrames?: number;
}

export interface JobStatusResponse {
  jobId: string;
  status: JobStatus;
  progress?: JobProgress;
  error?: string;
  videoUrl?: string;
  createdAt: string;
  completedAt?: string;
}

export interface UploadResponse {
  jobId: string;
  status: JobStatus;
}
