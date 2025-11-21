'use client';

import { JobStatus, JobProgress } from '@/lib/types/face-swap.types';
import Card from '@/components/ui/card/card';
import Progress from '@/components/ui/progress/progress';
import './processing-status.style.scss';

interface ProcessingStatusProps {
  status: JobStatus;
  progress?: JobProgress | null;
}

export default function ProcessingStatus({
  status,
  progress,
}: ProcessingStatusProps) {
  const getStatusText = () => {
    switch (status) {
      case JobStatus.QUEUED:
        return 'Đang xếp hàng...';
      case JobStatus.PROCESSING:
        return progress?.stage === 'extracting'
          ? 'Đang trích xuất khung hình...'
          : progress?.stage === 'processing'
            ? 'Đang xử lý...'
            : progress?.stage === 'rendering'
              ? 'Đang render video...'
              : 'Đang xử lý...';
      default:
        return 'Đang xử lý...';
    }
  };

  return (
    <Card className="processing-status">
      <div className="processing-status__content">
        <h2 className="processing-status__title">{getStatusText()}</h2>
        {progress && (
          <div className="processing-status__progress">
            <Progress value={progress.percentage} showLabel />
            {progress.currentFrame !== undefined &&
              progress.totalFrames !== undefined && (
                <p className="processing-status__frames">
                  Khung hình {progress.currentFrame} / {progress.totalFrames}
                </p>
              )}
          </div>
        )}
        <div className="processing-status__spinner">
          <div className="spinner"></div>
        </div>
      </div>
    </Card>
  );
}

