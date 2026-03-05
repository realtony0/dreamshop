"use client";

import * as React from "react";
import Image, { type ImageProps } from "next/image";

type SafeImageProps = Omit<ImageProps, "alt"> & {
  alt: string;
  fallbackSrc?: string;
};

function createInlineFallback(label: string) {
  const safeLabel = label.replace(/[<>&"]/g, "").slice(0, 34) || "Image";
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='1500' viewBox='0 0 1200 1500'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='#f3f4f6'/><stop offset='100%' stop-color='#e5e7eb'/></linearGradient></defs><rect width='1200' height='1500' fill='url(#g)'/><text x='50%' y='50%' fill='#374151' font-family='Arial, sans-serif' font-size='44' text-anchor='middle'>${safeLabel}</text><text x='50%' y='56%' fill='#6b7280' font-family='Arial, sans-serif' font-size='28' text-anchor='middle'>Image indisponible</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function SafeImage({
  src,
  alt,
  fallbackSrc,
  onError,
  ...props
}: SafeImageProps) {
  const resolvedFallback = React.useMemo(
    () => fallbackSrc ?? createInlineFallback(alt),
    [alt, fallbackSrc]
  );
  const [currentSrc, setCurrentSrc] = React.useState<ImageProps["src"]>(src);

  React.useEffect(() => {
    setCurrentSrc(src);
  }, [src]);

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      onError={(event) => {
        if (typeof currentSrc === "string" && currentSrc !== resolvedFallback) {
          setCurrentSrc(resolvedFallback);
        }
        onError?.(event);
      }}
    />
  );
}
