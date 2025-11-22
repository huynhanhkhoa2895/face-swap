import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs/promises';
import { FacePosition, Template } from '../../template/entities/template.entity';
import { VideoProcessingService } from './video-processing.service';

interface SwapOptions {
  quality?: number;
  blendMode?: 'over' | 'multiply' | 'screen';
}

@Injectable()
export class SimpleFaceSwapService {
  private readonly logger = new Logger(SimpleFaceSwapService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly videoProcessingService: VideoProcessingService,
  ) {}

  /**
   * Overlay user face onto a single frame at specified position
   */
  async overlayFaceOnFrame(
    framePath: string,
    userFacePath: string,
    outputPath: string,
    facePosition: FacePosition,
    options: SwapOptions = {},
  ): Promise<void> {
    const { quality = 90, blendMode = 'over' } = options;

    try {
      // Prepare user face with proper sizing and optional rotation
      const processedFace = await this.prepareUserFace(userFacePath, facePosition);

      // Load original frame
      const frameBuffer = await fs.readFile(framePath);

      // Composite face onto frame
      // Use PNG format to match VideoProcessingService expectations
      await sharp(frameBuffer)
        .composite([
          {
            input: processedFace,
            top: Math.round(facePosition.y),
            left: Math.round(facePosition.x),
            blend: blendMode,
          },
        ])
        .png()
        .toFile(outputPath);

      this.logger.debug(`Frame processed: ${path.basename(outputPath)}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error processing frame: ${errorMessage}`);
      // On error, copy original frame
      await fs.copyFile(framePath, outputPath);
    }
  }

  /**
   * Prepare user face: resize, rotate, and apply effects
   */
  private async prepareUserFace(
    userFacePath: string,
    facePosition: FacePosition,
  ): Promise<Buffer> {
    let faceProcessor = sharp(userFacePath);

    // Apply rotation if specified
    if (facePosition.rotation && facePosition.rotation !== 0) {
      faceProcessor = faceProcessor.rotate(facePosition.rotation, {
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      });
    }

    // Resize to target dimensions
    faceProcessor = faceProcessor.resize(
      Math.round(facePosition.width),
      Math.round(facePosition.height),
      {
        fit: 'cover',
        position: 'center',
      },
    );

    return faceProcessor.toBuffer();
  }

  /**
   * Get face position for a specific frame number
   */
  private getFacePositionForFrame(
    frameNumber: number,
    template: Template,
  ): FacePosition | null {
    // Find the face position that applies to this frame
    const position = template.facePositions.find((pos) => {
      const start = pos.frameStart ?? 0;
      const end = pos.frameEnd ?? template.totalFrames;
      return frameNumber >= start && frameNumber <= end;
    });

    // If no specific position found, use first position as default
    return position ?? template.facePositions[0] ?? null;
  }

  /**
   * Process entire video with template
   */
  async processVideo(
    templateMetadata: Template,
    userImagePath: string,
    outputVideoPath: string,
    onProgress?: (progress: number) => void,
  ): Promise<string> {
    const workDir = path.join(
      this.configService.get<string>('paths.temp') || './temp',
      `job-${Date.now()}`,
    );
    const framesDir = path.join(workDir, 'frames');
    const processedDir = path.join(workDir, 'processed');

    try {
      // Create directories
      await fs.mkdir(framesDir, { recursive: true });
      await fs.mkdir(processedDir, { recursive: true });

      this.logger.log('Step 1/4: Extracting frames from template video...');
      const templateVideoPath = path.isAbsolute(templateMetadata.videoPath)
        ? templateMetadata.videoPath
        : path.join(process.cwd(), templateMetadata.videoPath);

      const frameFiles = await this.videoProcessingService.extractFrames(
        templateVideoPath,
        framesDir,
        { fps: templateMetadata.fps },
        (progress) => {
          if (onProgress) {
            onProgress(Math.round(progress.percentage * 0.25)); // 0-25%
          }
        },
      );

      this.logger.log(`Step 2/4: Processing ${frameFiles.length} frames...`);

      // Process each frame
      for (let i = 0; i < frameFiles.length; i++) {
        const frameNumber = i;
        const framePath = frameFiles[i];
        const frameName = path.basename(framePath);
        const outputPath = path.join(processedDir, frameName);

        // Get face position for this frame
        const facePosition = this.getFacePositionForFrame(frameNumber, templateMetadata);

        if (facePosition) {
          await this.overlayFaceOnFrame(framePath, userImagePath, outputPath, facePosition);
        } else {
          // No face position - copy original frame
          await fs.copyFile(framePath, outputPath);
        }

        // Report progress
        const progress = Math.round(((i + 1) / frameFiles.length) * 50) + 25; // 25-75%
        if (onProgress) {
          onProgress(progress);
        }

        if ((i + 1) % 30 === 0) {
          this.logger.log(`  Processed ${i + 1}/${frameFiles.length} frames`);
        }
      }

      this.logger.log('Step 3/4: Creating video from processed frames...');
      const videoWithoutAudio = outputVideoPath.replace('.mp4', '-no-audio.mp4');
      await this.videoProcessingService.framesToVideo(
        processedDir,
        videoWithoutAudio,
        { fps: templateMetadata.fps },
        (progress) => {
          if (onProgress) {
            onProgress(75 + Math.round(progress.percentage * 0.05)); // 75-80%
          }
        },
      );

      if (onProgress) onProgress(80);

      this.logger.log('Step 4/4: Adding audio to video...');
      const audioSourcePath = templateMetadata.audioPath
        ? path.isAbsolute(templateMetadata.audioPath)
          ? templateMetadata.audioPath
          : path.join(process.cwd(), templateMetadata.audioPath)
        : templateVideoPath;

      await this.videoProcessingService.addAudioToVideo(
        videoWithoutAudio,
        audioSourcePath,
        outputVideoPath,
      );

      // Cleanup intermediate video without audio
      await fs.unlink(videoWithoutAudio).catch(() => {
        // Ignore cleanup errors
      });

      if (onProgress) onProgress(100);

      this.logger.log('✅ Video processing completed successfully');
      return outputVideoPath;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Video processing failed: ${errorMessage}`);
      throw error;
    } finally {
      // Cleanup temporary files
      try {
        await fs.rm(workDir, { recursive: true, force: true });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.logger.warn(`Cleanup failed: ${errorMessage}`);
      }
    }
  }
}

