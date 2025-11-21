'use client';

import { use } from 'react';
import { ProcessingStatus } from '@/components/face-swap/processing-status/processing-status';
import VideoPlayer from '@/components/video/video-player/video-player';
import { usePolling } from '@/lib/hooks/use-polling';
import { useFaceSwapStore } from '@/lib/store/face-swap-store';
import { JobStatus } from '@/lib/types/face-swap.types';

interface ResultPageProps {
  params: Promise<{ jobId: string }>;
}

export default function ResultPage({ params }: ResultPageProps) {
  const { jobId } = use(params);
  const store = useFaceSwapStore();

  usePolling(jobId, { enabled: true });

  const isProcessing =
    store.status === JobStatus.QUEUED || store.status === JobStatus.PROCESSING;

  const isCompleted = store.status === JobStatus.COMPLETED;
  const isFailed = store.status === JobStatus.FAILED;

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {isProcessing && (
          <ProcessingStatus progress={store.progress} status={store.status} />
        )}

        {isCompleted && store.videoUrl && (
          <VideoPlayer videoUrl={store.videoUrl} jobId={jobId} />
        )}

        {isFailed && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Có lỗi xảy ra
            </h2>
            <p className="text-gray-600 mb-8">{store.error}</p>
          </div>
        )}
      </div>
    </main>
  );
}

