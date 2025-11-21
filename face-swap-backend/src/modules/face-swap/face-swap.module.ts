import { Module } from '@nestjs/common';
import { FaceSwapController } from './face-swap.controller';
import { FaceSwapService } from './services/face-swap.service';
import { VideoProcessingService } from './services/video-processing.service';
import { FaceDetectionService } from './services/face-detection.service';
import { FaceSwapProcessor } from './processors/face-swap.processor';
import { TemplateModule } from '../template/template.module';
import { UserTrackingModule } from '../user-tracking/user-tracking.module';

@Module({
  imports: [TemplateModule, UserTrackingModule],
  controllers: [FaceSwapController],
  providers: [FaceSwapService, VideoProcessingService, FaceDetectionService, FaceSwapProcessor],
  exports: [FaceSwapService],
})
export class FaceSwapModule {}
