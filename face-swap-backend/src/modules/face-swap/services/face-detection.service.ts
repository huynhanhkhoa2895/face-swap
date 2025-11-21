import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { FaceDetectionResult, ValidationResult, BoundingBox } from '../types/face.types';

// Lazy load face-api to avoid startup errors if dependencies are missing
let faceapi: typeof import('@vladmandic/face-api') | null = null;
let faceApiLoaded = false;
let faceApiLoadError: Error | null = null;

function loadFaceApi(): typeof import('@vladmandic/face-api') {
  if (!faceApiLoaded && !faceApiLoadError) {
    try {
      faceapi = require('@vladmandic/face-api');
      if (!faceapi) {
        throw new Error('Face-api module returned null');
      }
      faceApiLoaded = true;
    } catch (error) {
      faceApiLoadError =
        error instanceof Error ? error : new Error('Unknown error loading face-api');
      faceApiLoaded = false;
      throw new Error(
        `Face-api module not available. Please install @tensorflow/tfjs-node: ${faceApiLoadError.message}`,
      );
    }
  }

  if (faceApiLoadError) {
    throw new Error(
      `Face-api module not available. Please install @tensorflow/tfjs-node: ${faceApiLoadError.message}`,
    );
  }

  if (!faceapi) {
    throw new Error('Face-api module failed to load');
  }

  return faceapi;
}

function canLoadFaceApi(): boolean {
  if (faceApiLoaded) {
    return true;
  }
  if (faceApiLoadError) {
    return false;
  }
  // Check if @tensorflow/tfjs-node exists first, as face-api requires it at load time
  try {
    require.resolve('@tensorflow/tfjs-node');
    // If tfjs-node exists, try to load face-api
    try {
      require('@vladmandic/face-api');
      return true;
    } catch {
      return false;
    }
  } catch {
    // @tensorflow/tfjs-node is not installed
    return false;
  }
}

// Lazy load canvas and face-api to avoid startup errors if not compiled
let canvasModule: typeof import('canvas') | null = null;
let canvasLoaded = false;
let monkeyPatchDone = false;

function loadCanvas(): typeof import('canvas') {
  if (!canvasLoaded) {
    try {
      canvasModule = require('canvas');
      if (!canvasModule) {
        throw new Error('Canvas module returned null');
      }
      canvasLoaded = true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(
        `Canvas module not available. Please install canvas package: ${errorMessage}`,
      );
    }
  }

  if (!canvasModule) {
    throw new Error('Canvas module failed to load');
  }

  return canvasModule;
}

function setupFaceApiMonkeyPatch(): void {
  if (!monkeyPatchDone) {
    try {
      const faceApiModule = loadFaceApi();
      const canvas = loadCanvas();
      const { Canvas, Image, ImageData } = canvas;
      // Type assertion for face-api compatibility - using 'any' to bypass type checking for monkeyPatch
      faceApiModule.env.monkeyPatch({
        Canvas: Canvas as any,
        Image: Image as any,
        ImageData: ImageData as any,
      } as any);
      monkeyPatchDone = true;
    } catch (error) {
      // Silently fail - monkey patch will be retried when face-api is actually used
      // This allows the server to start without face-api dependencies
    }
  }
}

@Injectable()
export class FaceDetectionService implements OnModuleInit {
  private readonly logger = new Logger(FaceDetectionService.name);
  private modelsLoaded = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    // Try to load models, but don't fail if dependencies are not available
    try {
      // Check if face-api can be loaded before attempting
      if (!canLoadFaceApi()) {
        this.logger.error('⚠️  FACE DETECTION DISABLED: @tensorflow/tfjs-node is not installed');
        this.logger.error(
          '⚠️  Face detection is the MAIN FEATURE - the app will not work without it!',
        );
        this.logger.error('📖 See INSTALL_TENSORFLOW.md for installation instructions');
        this.logger.error('🔧 Prerequisites: Python 3.x + Visual Studio Build Tools (C++)');
        this.logger.error('💻 Quick install: npm install @tensorflow/tfjs-node');
        return;
      }
      await this.loadModels();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Face detection models not loaded: ${errorMessage}`);
      this.logger.warn('Face detection will not be available until dependencies are installed');
      this.logger.warn('Required: @tensorflow/tfjs-node, canvas (with native compilation)');
    }
  }

  private async loadModels(): Promise<void> {
    try {
      // Setup monkey patch first
      setupFaceApiMonkeyPatch();
      const faceApiModule = loadFaceApi();
      const modelPath = this.configService.get<string>('paths.models') || 'src/models';

      await Promise.all([
        faceApiModule.nets.ssdMobilenetv1.loadFromDisk(modelPath),
        faceApiModule.nets.faceLandmark68Net.loadFromDisk(modelPath),
        faceApiModule.nets.faceRecognitionNet.loadFromDisk(modelPath),
      ]);

      this.modelsLoaded = true;
      this.logger.log('Face detection models loaded successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Failed to load face detection models: ${errorMessage}`);
      this.logger.warn('Face detection will not be available until dependencies are installed');
      this.logger.warn('Required: @tensorflow/tfjs-node, canvas (with native compilation)');
      // Don't throw - allow server to start without face detection
    }
  }

  async detectFace(imagePath: string): Promise<FaceDetectionResult> {
    if (!this.modelsLoaded) {
      throw new Error(
        'Face detection models not loaded. Please install @tensorflow/tfjs-node and canvas packages.',
      );
    }

    setupFaceApiMonkeyPatch();
    const canvasModule = loadCanvas();
    const faceApiModule = loadFaceApi();

    try {
      const img = await canvasModule.loadImage(imagePath);
      const detection = await faceApiModule
        .detectSingleFace(img as unknown as HTMLImageElement)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        throw new Error('No face detected in image');
      }

      return {
        detection: detection.detection,
        landmarks: detection.landmarks,
        descriptor: detection.descriptor,
        box: {
          x: detection.detection.box.x,
          y: detection.detection.box.y,
          width: detection.detection.box.width,
          height: detection.detection.box.height,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Face detection error: ${errorMessage}`);
      throw error;
    }
  }

  async validateFace(imagePath: string): Promise<ValidationResult> {
    const errors: string[] = [];
    let confidence = 0;

    try {
      const result = await this.detectFace(imagePath);
      confidence = result.detection.score;

      if (confidence < 0.5) {
        errors.push('Face detection confidence too low');
      }

      const box = result.box;
      const minSize = 50;
      if (box.width < minSize || box.height < minSize) {
        errors.push('Face too small in image');
      }

      if (box.x < 0 || box.y < 0) {
        errors.push('Face position invalid');
      }

      return {
        isValid: errors.length === 0,
        errors,
        confidence,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errors.push(errorMessage);
      return {
        isValid: false,
        errors,
        confidence: 0,
      };
    }
  }

  async extractFaceRegion(imagePath: string, box: BoundingBox): Promise<Buffer> {
    const canvasModule = loadCanvas();

    try {
      const img = await canvasModule.loadImage(imagePath);
      const canvasInstance = canvasModule.createCanvas(img.width, img.height);
      const ctx = canvasInstance.getContext('2d');

      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(
        Math.max(0, box.x),
        Math.max(0, box.y),
        Math.min(box.width, img.width - box.x),
        Math.min(box.height, img.height - box.y),
      );

      const faceCanvas = canvasModule.createCanvas(box.width, box.height);
      const faceCtx = faceCanvas.getContext('2d');
      faceCtx.putImageData(imageData, 0, 0);

      return faceCanvas.toBuffer('image/png');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Face extraction error: ${errorMessage}`);
      throw error;
    }
  }
}
