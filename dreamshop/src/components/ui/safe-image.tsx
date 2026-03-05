"use client";

import * as React from "react";
import Image, { type ImageProps } from "next/image";

type SafeImageProps = Omit<ImageProps, "alt"> & {
  alt: string;
  fallbackSrc?: string;
};

export function SafeImage({
  src,
  alt,
  fallbackSrc = "/products/placeholder.jpg",
  onError,
  ...props
}: SafeImageProps) {
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
        if (typeof currentSrc === "string" && currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        }
        onError?.(event);
      }}
    />
  );
}
