"use client";

import { useRef } from "react";

type RetryableImageProps = {
  src: string;
  alt: string;
  className?: string;
  maxRetries?: number;
  retryDelayMs?: number;
};

export function RetryableImage({
  src,
  alt,
  className,
  maxRetries = 3,
  retryDelayMs = 1500
}: RetryableImageProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const retriesRef = useRef(0);
  // Prevents the transient src="" assignment from triggering another retry cycle.
  const isResettingRef = useRef(false);

  const handleError = () => {
    if (isResettingRef.current) return;
    if (retriesRef.current >= maxRetries) return;

    retriesRef.current++;
    const delay = retryDelayMs * retriesRef.current;

    setTimeout(() => {
      const img = imgRef.current;
      if (!img) return;
      isResettingRef.current = true;
      img.src = "";
      isResettingRef.current = false;
      img.src = src;
    }, delay);
  };

  return (
    <img ref={imgRef} src={src} alt={alt} className={className} onError={handleError} />
  );
}
