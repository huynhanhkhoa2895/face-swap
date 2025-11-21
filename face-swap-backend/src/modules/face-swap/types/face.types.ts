import * as faceapi from '@vladmandic/face-api';

export interface FaceDetectionResult {
  detection: faceapi.FaceDetection;
  landmarks: faceapi.FaceLandmarks68;
  descriptor: Float32Array;
  box: BoundingBox;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FaceAlignment {
  rotation: number;
  scale: number;
  translation: { x: number; y: number };
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  confidence: number;
}

