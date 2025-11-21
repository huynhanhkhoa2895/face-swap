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
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Template {
  id: string;
  name: string;
  character: CharacterType;
  gender: Gender;
  videoPath: string;
  thumbnailPath: string;
  duration: number;
  fps: number;
  resolution: VideoResolution;
  facePosition: FacePosition;
  createdAt: Date;
  updatedAt: Date;
}

