import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FaceSwapController } from './face-swap.controller';
import { SimpleFaceSwapService } from './services/simple-face-swap.service';
import { VideoProcessingService } from './services/video-processing.service';
import { FaceSwapProcessor } from './processors/face-swap.processor';
import { TemplateModule } from '../template/template.module';
import { UserTrackingModule } from '../user-tracking/user-tracking.module';

@Module({
  imports: [ConfigModule, TemplateModule, UserTrackingModule],
  controllers: [FaceSwapController],
  providers: [SimpleFaceSwapService, VideoProcessingService, FaceSwapProcessor],
  exports: [SimpleFaceSwapService],
})
export class FaceSwapModule {}
