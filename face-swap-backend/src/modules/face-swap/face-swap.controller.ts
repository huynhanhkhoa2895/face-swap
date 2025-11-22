import {
  Controller,
  Post,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { FaceSwapProcessor } from './processors/face-swap.processor';
import { TemplateService } from '../template/template.service';
import { UserTrackingService } from '../user-tracking/user-tracking.service';
import { QuotaGuard } from '../user-tracking/guards/quota.guard';
import { CheckQuota } from '../user-tracking/decorators/check-quota.decorator';
import { UploadFaceSwapDto } from './dto/upload.dto';
import { JobStatusResponseDto, JobStatus } from './dto/job-status.dto';
import { FileUploadInterceptor } from './interceptors/file-upload.interceptor';

@Controller('face-swap')
export class FaceSwapController {
  constructor(
    private readonly faceSwapProcessor: FaceSwapProcessor,
    private readonly templateService: TemplateService,
    private readonly userTrackingService: UserTrackingService,
  ) {}

  @Post('upload')
  @UseGuards(QuotaGuard)
  @CheckQuota()
  @UseInterceptors(FileUploadInterceptor())
  async upload(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req()
    req: {
      body: UploadFaceSwapDto;
      ip?: string;
      headers: { [key: string]: string | string[] | undefined };
    },
  ): Promise<{ jobId: string; status: JobStatus }> {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    const dto: UploadFaceSwapDto = req.body as UploadFaceSwapDto;

    // Validate template exists
    try {
      await this.templateService.getTemplateById(dto.templateId);
    } catch (error) {
      throw new BadRequestException('Template not found');
    }

    // Get user identifier
    const identifier = await this.userTrackingService.getUserIdentifier(req);

    // Create job and process asynchronously
    const jobId = uuidv4();
    this.faceSwapProcessor.updateJobStatus(jobId, JobStatus.QUEUED);

    // Process in background (non-blocking)
    this.faceSwapProcessor
      .processFaceSwap({
        jobId,
        userImagePath: file.path,
        templateId: dto.templateId,
        userId: identifier.ip,
        userIp: identifier.ip,
        userAgent: identifier.userAgent,
      })
      .catch((error) => {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.faceSwapProcessor.updateJobStatus(jobId, JobStatus.FAILED, { error: errorMessage });
      });

    return {
      jobId,
      status: JobStatus.QUEUED,
    };
  }

  @Get('status/:jobId')
  async getStatus(@Param('jobId') jobId: string): Promise<JobStatusResponseDto> {
    const jobStatus = this.faceSwapProcessor.getJobStatus(jobId);

    if (!jobStatus) {
      throw new BadRequestException('Job not found');
    }

    return {
      jobId,
      status: jobStatus.status,
      progress: jobStatus.progress as
        | { stage: string; percentage: number; currentFrame?: number; totalFrames?: number }
        | undefined,
      error: jobStatus.error,
      videoUrl: jobStatus.videoUrl,
      createdAt: jobStatus.createdAt,
    };
  }

  @Get('download/:jobId')
  async download(@Param('jobId') jobId: string): Promise<{ url: string }> {
    const jobStatus = this.faceSwapProcessor.getJobStatus(jobId);

    if (!jobStatus || jobStatus.status !== JobStatus.COMPLETED || !jobStatus.videoUrl) {
      throw new BadRequestException('Video not available');
    }

    return {
      url: jobStatus.videoUrl,
    };
  }
}
