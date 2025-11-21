'use client';

import { useRef, useEffect } from 'react';
import Card from '@/components/ui/card/card';
import Button from '@/components/ui/button/button';
import './video-player.style.scss';

interface VideoPlayerProps {
  videoUrl: string;
  jobId: string;
}

export default function VideoPlayer({ videoUrl, jobId }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `face-swap-${jobId}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="video-player">
      <div className="video-player__content">
        <h2 className="video-player__title">Video đã hoàn thành!</h2>
        <div className="video-player__video-container">
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            className="video-player__video"
          >
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="video-player__actions">
          <Button onClick={handleDownload} size="lg">
            Tải xuống
          </Button>
        </div>
      </div>
    </Card>
  );
}

