import { useEffect, useRef, useCallback } from "react";
import { faceSwapApi } from "@/lib/api/face-swap";
import { useFaceSwapStore } from "@/lib/store/face-swap-store";
import { JobStatus } from "@/lib/types/face-swap.types";

interface UsePollingOptions {
  interval?: number;
  maxAttempts?: number;
  enabled?: boolean;
}

export function usePolling(
  jobId: string | null,
  options: UsePollingOptions = {}
) {
  const {
    interval = 2000,
    maxAttempts = 150, // 5 minutes max
    enabled = true,
  } = options;

  const store = useFaceSwapStore();
  const attemptCount = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const pollStatus = useCallback(async () => {
    if (!jobId || !enabled) return;

    attemptCount.current += 1;

    if (attemptCount.current > maxAttempts) {
      store.setError("Processing timeout");
      return;
    }

    try {
      const status = await faceSwapApi.getStatus(jobId);

      store.setStatus(status.status);
      store.setProgress(status.progress || null);

      if (status.status === JobStatus.COMPLETED && status.videoUrl) {
        const fullUrl = `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
        }${status.videoUrl}`;
        store.setVideoUrl(fullUrl);
        return;
      }

      if (status.status === JobStatus.FAILED) {
        store.setError(status.error || "Processing failed");
        return;
      }

      // Continue polling
      if (
        status.status === JobStatus.QUEUED ||
        status.status === JobStatus.PROCESSING
      ) {
        timeoutRef.current = setTimeout(pollStatus, interval);
      }
    } catch (error) {
      store.setError("Failed to check status");
    }
  }, [jobId, enabled, interval, maxAttempts, store]);

  useEffect(() => {
    if (jobId && enabled) {
      attemptCount.current = 0;
      pollStatus();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [jobId, enabled, pollStatus]);

  return { pollStatus };
}
