export interface VideoMetadata {
  duration: number;
  fps: number;
  width: number;
  height: number;
  codec: string;
  bitrate: number;
}

export interface FrameExtractionOptions {
  fps: number;
  quality: number;
  format: 'png' | 'jpg';
}

export interface VideoCreationOptions {
  fps: number;
  codec: string;
  preset: string;
  crf: number;
}

export interface ProcessingProgress {
  stage: 'extracting' | 'processing' | 'rendering' | 'finalizing';
  percentage: number;
  currentFrame?: number;
  totalFrames?: number;
}

export type ProgressCallback = (progress: ProcessingProgress) => void;

