"use client";

import { useRef } from "react";

type ResettableVideoProps = {
  src: string;
  className?: string;
  poster?: string;
};

export function ResettableVideo({ src, className, poster }: ResettableVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleLoadedMetadata = () => {
    if (!videoRef.current || poster) return;
    if (videoRef.current.duration <= 0) return;
    // Force the browser to render the first decodable frame as preview.
    if (videoRef.current.currentTime === 0) {
      videoRef.current.currentTime = 0.001;
    }
  };

  const handleEnded = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.pause();
  };

  return (
    <video
      ref={videoRef}
      controls
      playsInline
      preload="metadata"
      poster={poster}
      onLoadedMetadata={handleLoadedMetadata}
      onEnded={handleEnded}
      className={className}
    >
      <source src={src} type="video/mp4" />
      Votre navigateur ne supporte pas la lecture vidéo.
    </video>
  );
}
