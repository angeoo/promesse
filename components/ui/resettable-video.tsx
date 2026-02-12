"use client";

import { useRef } from "react";

type ResettableVideoProps = {
  src: string;
  className?: string;
};

export function ResettableVideo({ src, className }: ResettableVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

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
      onEnded={handleEnded}
      className={className}
    >
      <source src={src} type="video/mp4" />
      Votre navigateur ne supporte pas la lecture vidéo.
    </video>
  );
}
