import { Injectable, Logger } from '@nestjs/common';
import sharp from 'sharp';
import { SwapOptions, TransformMatrix, ColorAdjustment } from '../types/swap.types';
import { FaceDetectionResult, BoundingBox } from '../types/face.types';

// Lazy load face-api to avoid startup errors if dependencies are missing
let faceapi: typeof import('@vladmandic/face-api') | null = null;
let faceApiLoaded = false;
let faceApiLoadError: Error | null = null;

function loadFaceApi(): typeof import('@vladmandic/face-api') {
  if (!faceApiLoaded && !faceApiLoadError) {
    try {
      // Check if @tensorflow/tfjs-node exists first, as face-api requires it at load time
      try {
        require.resolve('@tensorflow/tfjs-node');
      } catch {
        throw new Error('@tensorflow/tfjs-node is not installed');
      }

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

// Lazy load canvas to avoid startup errors if not compiled
let canvas: typeof import('canvas') | null = null;
let canvasLoaded = false;

function loadCanvas(): typeof import('canvas') {
  if (!canvasLoaded) {
    try {
      canvas = require('canvas');
      canvasLoaded = true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(
        `Canvas module not available. Please install canvas package: ${errorMessage}`,
      );
    }
  }
  if (!canvas) {
    throw new Error('Canvas module failed to load');
  }
  return canvas;
}

@Injectable()
export class FaceSwapService {
  private readonly logger = new Logger(FaceSwapService.name);

  async swapFaceInFrame(
    framePath: string,
    userFacePath: string,
    outputPath: string,
    options: Partial<SwapOptions> = {},
  ): Promise<void> {
    const defaultOptions: SwapOptions = {
      blendMode: 'smooth',
      colorMatch: true,
      featherRadius: 15,
      alphaBlend: 0.95,
      ...options,
    };

    const canvasModule = loadCanvas();
    const faceApiModule = loadFaceApi();

    // Setup monkey patch for face-api
    const canvas = loadCanvas();
    const { Canvas, Image, ImageData } = canvas;
    faceApiModule.env.monkeyPatch({
      Canvas: Canvas as any,
      Image: Image as any,
      ImageData: ImageData as any,
    } as any);

    try {
      // Load frame and user face
      const frameImage = await canvasModule.loadImage(framePath);
      const userFaceImage = await canvasModule.loadImage(userFacePath);

      // Detect faces in both images
      const frameDetection = await faceApiModule
        .detectSingleFace(frameImage as unknown as HTMLImageElement)
        .withFaceLandmarks();

      const userFaceDetection = await faceApiModule
        .detectSingleFace(userFaceImage as unknown as HTMLImageElement)
        .withFaceLandmarks();

      if (!frameDetection || !userFaceDetection) {
        throw new Error('Face detection failed');
      }

      // Extract and align user face
      const alignedFace = await this.extractAndAlignFace(
        userFacePath,
        userFaceDetection.landmarks,
        frameDetection.detection.box,
      );

      // Calculate transformation matrix
      const transform = this.calculateTransformMatrix(
        userFaceDetection.landmarks,
        frameDetection.landmarks,
      );

      // Apply color matching if enabled
      let processedFace = alignedFace;
      if (defaultOptions.colorMatch) {
        const frameBuffer = await sharp(framePath).toBuffer();
        processedFace = await this.applyColorMatching(processedFace, frameBuffer);
      }

      // Create output canvas
      const outputCanvas = canvasModule.createCanvas(frameImage.width, frameImage.height);
      const ctx = outputCanvas.getContext('2d');

      // Draw original frame
      ctx.drawImage(frameImage, 0, 0);

      // Apply face swap with blending
      await this.applyFaceSwap(
        ctx as unknown as CanvasRenderingContext2D,
        processedFace,
        frameDetection.detection.box,
        transform,
        defaultOptions,
      );

      // Save output
      const buffer = outputCanvas.toBuffer('image/png');
      await sharp(buffer).png().toFile(outputPath);

      this.logger.log(`Face swapped in frame: ${outputPath}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Face swap error: ${errorMessage}`);
      throw error;
    }
  }

  private async extractAndAlignFace(
    imagePath: string,
    sourceLandmarks: import('@vladmandic/face-api').FaceLandmarks68,
    targetBox: BoundingBox,
  ): Promise<Buffer> {
    const canvasModule = loadCanvas();
    const img = await canvasModule.loadImage(imagePath);
    const canvasInstance = canvasModule.createCanvas(targetBox.width, targetBox.height);
    const ctx = canvasInstance.getContext('2d');

    // Get face center from landmarks
    const center = this.getCenter(sourceLandmarks.positions);

    // Calculate scale
    const sourceWidth =
      Math.max(...sourceLandmarks.positions.map((p) => p.x)) -
      Math.min(...sourceLandmarks.positions.map((p) => p.x));
    const sourceHeight =
      Math.max(...sourceLandmarks.positions.map((p) => p.y)) -
      Math.min(...sourceLandmarks.positions.map((p) => p.y));

    const scaleX = targetBox.width / sourceWidth;
    const scaleY = targetBox.height / sourceHeight;
    const scale = Math.min(scaleX, scaleY);

    // Transform and draw
    ctx.save();
    ctx.translate(targetBox.width / 2, targetBox.height / 2);
    ctx.scale(scale, scale);
    ctx.translate(-center.x, -center.y);
    ctx.drawImage(img, 0, 0);
    ctx.restore();

    return canvasInstance.toBuffer('image/png');
  }

  private calculateTransformMatrix(
    sourceLandmarks: import('@vladmandic/face-api').FaceLandmarks68,
    targetLandmarks: import('@vladmandic/face-api').FaceLandmarks68,
  ): TransformMatrix {
    const sourceCenter = this.getCenter(sourceLandmarks.positions);
    const targetCenter = this.getCenter(targetLandmarks.positions);

    // Calculate rotation (simplified - using eye angle)
    const sourceLeftEye = sourceLandmarks.positions[36];
    const sourceRightEye = sourceLandmarks.positions[45];
    const targetLeftEye = targetLandmarks.positions[36];
    const targetRightEye = targetLandmarks.positions[45];

    const sourceAngle = Math.atan2(
      sourceRightEye.y - sourceLeftEye.y,
      sourceRightEye.x - sourceLeftEye.x,
    );
    const targetAngle = Math.atan2(
      targetRightEye.y - targetLeftEye.y,
      targetRightEye.x - targetLeftEye.x,
    );

    const rotation = targetAngle - sourceAngle;

    // Calculate scale
    const sourceDistance = Math.sqrt(
      Math.pow(sourceRightEye.x - sourceLeftEye.x, 2) +
        Math.pow(sourceRightEye.y - sourceLeftEye.y, 2),
    );
    const targetDistance = Math.sqrt(
      Math.pow(targetRightEye.x - targetLeftEye.x, 2) +
        Math.pow(targetRightEye.y - targetLeftEye.y, 2),
    );

    const scale = targetDistance / sourceDistance;

    // Calculate translation
    const translation = {
      x: targetCenter.x - sourceCenter.x * scale,
      y: targetCenter.y - sourceCenter.y * scale,
    };

    return {
      rotation,
      scale: { x: scale, y: scale },
      translation,
    };
  }

  private async applyColorMatching(sourceBuffer: Buffer, targetBuffer: Buffer): Promise<Buffer> {
    const sourceImage = sharp(sourceBuffer);
    const targetImage = sharp(targetBuffer);

    // Get average colors
    const sourceStats = await sourceImage.stats();
    const targetStats = await targetImage.stats();

    const sourceR = sourceStats.channels[0]?.mean || 128;
    const sourceG = sourceStats.channels[1]?.mean || 128;
    const sourceB = sourceStats.channels[2]?.mean || 128;

    const targetR = targetStats.channels[0]?.mean || 128;
    const targetG = targetStats.channels[1]?.mean || 128;
    const targetB = targetStats.channels[2]?.mean || 128;

    // Calculate adjustment
    const adjustR = targetR - sourceR;
    const adjustG = targetG - sourceG;
    const adjustB = targetB - sourceB;

    // Apply color adjustment
    return await sourceImage
      .modulate({
        brightness: 1,
        saturation: 1,
      })
      .linear([adjustR / 255, adjustG / 255, adjustB / 255], [0, 0, 0])
      .toBuffer();
  }

  private async applyFaceSwap(
    ctx: CanvasRenderingContext2D,
    faceBuffer: Buffer,
    targetBox: BoundingBox,
    transform: TransformMatrix,
    options: SwapOptions,
  ): Promise<void> {
    const canvasModule = loadCanvas();
    const faceImage = await canvasModule.loadImage(faceBuffer);

    ctx.save();

    // Apply transformation
    ctx.translate(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2);
    ctx.rotate(transform.rotation);
    ctx.scale(transform.scale.x, transform.scale.y);
    ctx.translate(-faceImage.width / 2, -faceImage.height / 2);

    // Apply blending mode
    if (options.blendMode === 'smooth' || options.blendMode === 'seamless') {
      ctx.globalAlpha = options.alphaBlend;
      ctx.globalCompositeOperation = 'source-over';
    } else {
      ctx.globalAlpha = 1;
    }

    // Draw face with feathering
    if (options.featherRadius > 0) {
      // Create mask for feathering
      const maskCanvas = canvasModule.createCanvas(faceImage.width, faceImage.height);
      const maskCtx = maskCanvas.getContext('2d');
      const gradient = maskCtx.createRadialGradient(
        faceImage.width / 2,
        faceImage.height / 2,
        0,
        faceImage.width / 2,
        faceImage.height / 2,
        Math.min(faceImage.width, faceImage.height) / 2,
      );
      gradient.addColorStop(0, 'rgba(255,255,255,1)');
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      maskCtx.fillStyle = gradient;
      maskCtx.fillRect(0, 0, faceImage.width, faceImage.height);

      ctx.globalCompositeOperation = 'source-in';
      ctx.drawImage(maskCanvas as unknown as CanvasImageSource, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
    }

    ctx.drawImage(faceImage as unknown as CanvasImageSource, 0, 0);
    ctx.restore();
  }

  private getCenter(points: import('@vladmandic/face-api').Point[]): { x: number; y: number } {
    const sum = points.reduce(
      (acc, point) => ({
        x: acc.x + point.x,
        y: acc.y + point.y,
      }),
      { x: 0, y: 0 },
    );

    return {
      x: sum.x / points.length,
      y: sum.y / points.length,
    };
  }
}
