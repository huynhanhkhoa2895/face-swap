import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs/promises';
import { SimpleFaceSwapService } from '../services/simple-face-swap.service';
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
    private readonly simpleFaceSwapService: SimpleFaceSwapService,
    private readonly templateService: TemplateService,
    private readonly userTrackingService: UserTrackingService,
  ) {}

  async processFaceSwap(jobData: FaceSwapJobData): Promise<void> {
    const { jobId, userImagePath, templateId, userIp, userAgent } = jobData;

    this.updateJobStatus(jobId, JobStatus.PROCESSING);

    try {
      // Get template
      const template = await this.templateService.getTemplateById(templateId);

      // Create output video path
      const outputVideoPath = path.join(
        this.configService.get<string>('paths.outputs') || 'outputs',
        `${jobId}.mp4`,
      );

      // Ensure output directory exists
      await fs.mkdir(path.dirname(outputVideoPath), { recursive: true });

      // Process video with progress tracking
      await this.simpleFaceSwapService.processVideo(
        template,
        userImagePath,
        outputVideoPath,
        (progress) => {
          this.updateJobProgress(jobId, {
            stage: 'processing',
            percentage: progress,
          });
        },
      );

      // Cleanup uploaded file
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
