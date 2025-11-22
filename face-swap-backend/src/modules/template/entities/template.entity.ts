export enum CharacterType {
  COLLEAGUE = 'colleague',
  BOSS = 'boss',
  HOMIE = 'homie',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

export interface VideoResolution {
  width: number;
  height: number;
}

export interface FacePosition {
  x: number; // X coordinate (pixels from left)
  y: number; // Y coordinate (pixels from top)
  width: number; // Width of face region
  height: number; // Height of face region
  rotation?: number; // Optional rotation in degrees
  frameStart?: number; // Optional: frame where this position starts
  frameEnd?: number; // Optional: frame where this position ends
}

export interface Template {
  id: string;
  name: string;
  character: CharacterType;
  gender: Gender;
  videoPath: string;
  thumbnailPath: string;
  audioPath?: string; // Optional separate audio file
  duration: number;
  fps: number;
  resolution: VideoResolution;
  totalFrames: number;
  facePositions: FacePosition[]; // Array of face positions (one or multiple for different frames)
  createdAt: Date;
  updatedAt: Date;
}

