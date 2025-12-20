'use client';

import { useRef, useEffect } from 'react';

interface VideoPlayerProps {
  url: string;
  onProgress?: (progress: number) => void;
  onEnded?: () => void;
}

export function VideoPlayer({ url, onProgress, onEnded }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (onProgress && video.duration) {
        const progress = (video.currentTime / video.duration) * 100;
        onProgress(progress);
      }
    };

    const handleEnded = () => {
      if (onEnded) onEnded();
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onProgress, onEnded]);

  return (
    <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
      <video
        ref={videoRef}
        className="absolute top-0 left-0 w-full h-full"
        controls
        controlsList="nodownload"
        src={url}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
