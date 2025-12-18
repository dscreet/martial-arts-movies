'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';

interface ImageWithFallbackProps extends ImageProps {
  fallbackSrc: string;
}

export default function ImageWithFallback(props: ImageWithFallbackProps) {
  const { src, fallbackSrc, ...rest } = props;
  const [imgSrc, setImgSrc] = useState(src);

  return <Image {...rest} src={imgSrc} onError={() => setImgSrc(fallbackSrc)} />;
}
