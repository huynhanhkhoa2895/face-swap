import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ffmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import * as fs from 'fs/promises';
import {
  VideoMetadata,
  FrameExtractionOptions,
  VideoCreationOptions,
  ProgressCallback,
} from '../types/video.types';

@Injectable()
export class VideoProcessingService {
  private readonly logger = new Logger(VideoProcessingService.name);

  constructor(private readonly configService: ConfigService) {}

  async extractFrames(
    videoPath: string,
    outputDir: string,
    options: Partial<FrameExtractionOptions> = {},
    onProgress?: ProgressCallback,
  ): Promise<string[]> {
    const defaultOptions: FrameExtractionOptions = {
      fps: 30,
      quality: 2,
      format: 'png',
      ...options,
    };

    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    return new Promise<string[]>((resolve, reject) => {
      const frameFiles: string[] = [];
      const framePattern = path.join(outputDir, 'frame_%04d.' + defaultOptions.format);

      let totalFrames = 0;
      let currentFrame = 0;

      ffmpeg(videoPath)
        .on('start', (commandLine: string) => {
          this.logger.log(`FFmpeg command: ${commandLine}`);
        })
        .on('codecData', (data: { duration: string; video: string }) => {
          if (data.duration) {
            const duration = this.parseDuration(data.duration);
            totalFrames = Math.ceil(duration * defaultOptions.fps);
            this.logger.log(`Total frames to extract: ${totalFrames}`);
          }
        })
        .on('progress', (progress: { frames?: number; timemark?: string }) => {
          if (progress.frames !== undefined) {
            currentFrame = progress.frames;
            const percentage = totalFrames > 0 ? (currentFrame / totalFrames) * 100 : 0;

            if (onProgress) {
              onProgress({
                stage: 'extracting',
                percentage,
                currentFrame,
                totalFrames,
              });
            }
          }
        })
        .on('end', async () => {
          try {
            const files = await fs.readdir(outputDir);
            const frameFiles = files
              .filter((file) => file.startsWith('frame_'))
              .sort()
              .map((file) => path.join(outputDir, file));

            this.logger.log(`Extracted ${frameFiles.length} frames`);
            resolve(frameFiles);
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (error: Error) => {
          this.logger.error(`Frame extraction error: ${error.message}`);
          reject(error);
        })
        .outputOptions([`-vf fps=${defaultOptions.fps}`, `-qscale:v ${defaultOptions.quality}`])
        .output(framePattern)
        .run();
    });
  }

  async framesToVideo(
    framesDir: string,
    outputPath: string,
    options: Partial<VideoCreationOptions> = {},
    onProgress?: ProgressCallback,
  ): Promise<void> {
    const defaultOptions: VideoCreationOptions = {
      fps: 30,
      codec: 'libx264',
      preset: 'medium',
      crf: 23,
      ...options,
    };

    const framePattern = path.join(framesDir, 'frame_%04d.png');
    const outputDir = path.dirname(outputPath);
    await fs.mkdir(outputDir, { recursive: true });

    return new Promise<void>((resolve, reject) => {
      let totalFrames = 0;
      let currentFrame = 0;

      ffmpeg()
        .input(framePattern)
        .inputFPS(defaultOptions.fps)
        .on('start', (commandLine: string) => {
          this.logger.log(`FFmpeg command: ${commandLine}`);
        })
        .on('codecData', (data: { duration: string }) => {
          if (data.duration) {
            const duration = this.parseDuration(data.duration);
            totalFrames = Math.ceil(duration * defaultOptions.fps);
          }
        })
        .on('progress', (progress: { frames?: number }) => {
          if (progress.frames !== undefined) {
            currentFrame = progress.frames;
            const percentage = totalFrames > 0 ? (currentFrame / totalFrames) * 100 : 0;

            if (onProgress) {
              onProgress({
                stage: 'rendering',
                percentage,
                currentFrame,
                totalFrames,
              });
            }
          }
        })
        .on('end', () => {
          this.logger.log(`Video created: ${outputPath}`);
          resolve();
        })
        .on('error', (error: Error) => {
          this.logger.error(`Video creation error: ${error.message}`);
          reject(error);
        })
        .outputOptions([
          `-c:v ${defaultOptions.codec}`,
          `-preset ${defaultOptions.preset}`,
          `-crf ${defaultOptions.crf}`,
          '-pix_fmt yuv420p',
        ])
        .output(outputPath)
        .run();
    });
  }

  async getVideoMetadata(videoPath: string): Promise<VideoMetadata> {
    return new Promise<VideoMetadata>((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (error: Error | null, metadata: ffmpeg.FfprobeData) => {
        if (error) {
          reject(error);
          return;
        }

        const videoStream = metadata.streams.find((stream) => stream.codec_type === 'video');

        if (!videoStream) {
          reject(new Error('No video stream found'));
          return;
        }

        const duration = metadata.format.duration || 0;
        const fps = this.parseFps(videoStream.r_frame_rate || '30/1');
        const width = videoStream.width || 0;
        const height = videoStream.height || 0;
        const codec = videoStream.codec_name || 'unknown';
        const bitrateValue = metadata.format.bit_rate;
        const bitrate = bitrateValue
          ? typeof bitrateValue === 'string'
            ? parseInt(bitrateValue, 10)
            : bitrateValue
          : 0;

        resolve({
          duration,
          fps,
          width,
          height,
          codec,
          bitrate,
        });
      });
    });
  }

  async addAudioToVideo(videoPath: string, audioPath: string, outputPath: string): Promise<void> {
    const outputDir = path.dirname(outputPath);
    await fs.mkdir(outputDir, { recursive: true });

    return new Promise<void>((resolve, reject) => {
      ffmpeg()
        .input(videoPath)
        .input(audioPath)
        .on('end', () => {
          this.logger.log(`Video with audio created: ${outputPath}`);
          resolve();
        })
        .on('error', (error: Error) => {
          this.logger.error(`Audio merge error: ${error.message}`);
          reject(error);
        })
        .outputOptions(['-c:v copy', '-c:a aac', '-map 0:v:0', '-map 1:a:0'])
        .output(outputPath)
        .run();
    });
  }

  async cleanup(directory: string): Promise<void> {
    try {
      await fs.rm(directory, { recursive: true, force: true });
      this.logger.log(`Cleaned up directory: ${directory}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Failed to cleanup directory ${directory}: ${errorMessage}`);
    }
  }

  private parseDuration(duration: string): number {
    const parts = duration.split(':').map(parseFloat);
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return parseFloat(duration) || 0;
  }

  private parseFps(fps: string): number {
    const parts = fps.split('/');
    if (parts.length === 2) {
      const numerator = parseFloat(parts[0]);
      const denominator = parseFloat(parts[1]);
      return denominator > 0 ? numerator / denominator : 30;
    }
    return parseFloat(fps) || 30;
  }
}
