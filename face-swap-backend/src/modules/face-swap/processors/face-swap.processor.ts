import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs/promises';
import { VideoProcessingService } from '../services/video-processing.service';
import { FaceDetectionService } from '../services/face-detection.service';
import { FaceSwapService } from '../services/face-swap.service';
import { TemplateService } from '../../template/template.service';
import { UserTrackingService } from '../../user-tracking/user-tracking.service';
import { JobStatus } from '../dto/job-status.dto';

interface FaceSwapJobData {
  jobId: string;
  userImagePath: string;
  templateId: string;
  userId: string;
  userIp: string;
  userAgent: string;
}

@Injectable()
export class FaceSwapProcessor {
  private readonly logger = new Logger(FaceSwapProcessor.name);
  private jobStatuses: Map<
    string,
    { status: JobStatus; progress?: unknown; error?: string; videoUrl?: string; createdAt: Date }
  > = new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly videoProcessingService: VideoProcessingService,
    private readonly faceDetectionService: FaceDetectionService,
    private readonly faceSwapService: FaceSwapService,
    private readonly templateService: TemplateService,
    private readonly userTrackingService: UserTrackingService,
  ) {}

  async processFaceSwap(jobData: FaceSwapJobData): Promise<void> {
    const { jobId, userImagePath, templateId, userIp, userAgent } = jobData;

    this.updateJobStatus(jobId, JobStatus.PROCESSING);

    try {
      // Get template
      const template = await this.templateService.findOne(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      // Validate user face
      const validation = await this.faceDetectionService.validateFace(userImagePath);
      if (!validation.isValid) {
        throw new Error(`Face validation failed: ${validation.errors.join(', ')}`);
      }

      // Create temp directories
      const tempDir = path.join(this.configService.get<string>('paths.temp') || 'temp', jobId);
      const framesDir = path.join(tempDir, 'frames');
      const processedFramesDir = path.join(tempDir, 'processed');
      await fs.mkdir(framesDir, { recursive: true });
      await fs.mkdir(processedFramesDir, { recursive: true });

      // Extract frames from template video
      const templateVideoPath = path.join(process.cwd(), template.videoPath);
      const frameFiles = await this.videoProcessingService.extractFrames(
        templateVideoPath,
        framesDir,
        { fps: template.fps },
        (progress) => {
          this.updateJobProgress(jobId, {
            stage: 'extracting',
            percentage: progress.percentage,
            currentFrame: progress.currentFrame,
            totalFrames: progress.totalFrames,
          });
        },
      );

      // Process each frame
      let processedCount = 0;
      for (const framePath of frameFiles) {
        const frameName = path.basename(framePath);
        const outputPath = path.join(processedFramesDir, frameName);

        await this.faceSwapService.swapFaceInFrame(framePath, userImagePath, outputPath);

        processedCount++;
        const percentage = (processedCount / frameFiles.length) * 100;
        this.updateJobProgress(jobId, {
          stage: 'processing',
          percentage,
          currentFrame: processedCount,
          totalFrames: frameFiles.length,
        });
      }

      // Create video from processed frames
      const outputVideoPath = path.join(
        this.configService.get<string>('paths.outputs') || 'outputs',
        `${jobId}.mp4`,
      );
      await this.videoProcessingService.framesToVideo(
        processedFramesDir,
        outputVideoPath,
        { fps: template.fps },
        (progress) => {
          this.updateJobProgress(jobId, {
            stage: 'rendering',
            percentage: progress.percentage,
            currentFrame: progress.currentFrame,
            totalFrames: progress.totalFrames,
          });
        },
      );

      // Cleanup temp files
      await this.videoProcessingService.cleanup(tempDir);
      await fs.unlink(userImagePath).catch(() => {
        // Ignore cleanup errors
      });

      // Record generation
      await this.userTrackingService.recordGeneration(
        {
          ip: userIp,
          userAgent,
        },
        templateId,
      );

      const videoUrl = `/outputs/${jobId}.mp4`;
      this.updateJobStatus(jobId, JobStatus.COMPLETED, { videoUrl });
      this.logger.log(`Face swap completed for job: ${jobId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Face swap failed for job ${jobId}: ${errorMessage}`);
      this.updateJobStatus(jobId, JobStatus.FAILED, { error: errorMessage });
      throw error;
    }
  }

  updateJobStatus(
    jobId: string,
    status: JobStatus,
    data?: { videoUrl?: string; error?: string },
  ): void {
    const current = this.jobStatuses.get(jobId) || {
      status: JobStatus.QUEUED,
      createdAt: new Date(),
    };
    this.jobStatuses.set(jobId, {
      ...current,
      status,
      ...data,
    });
  }

  updateJobProgress(
    jobId: string,
    progress: {
      stage: string;
      percentage: number;
      currentFrame?: number;
      totalFrames?: number;
    },
  ): void {
    const current = this.jobStatuses.get(jobId) || {
      status: JobStatus.PROCESSING,
      createdAt: new Date(),
    };
    this.jobStatuses.set(jobId, {
      ...current,
      progress,
    });
  }

  getJobStatus(jobId: string): {
    status: JobStatus;
    progress?: unknown;
    error?: string;
    videoUrl?: string;
    createdAt: Date;
  } | null {
    return this.jobStatuses.get(jobId) || null;
  }
}
