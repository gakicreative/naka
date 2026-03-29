import React, { Suspense } from 'react';
import { useAnimation } from '../../contexts/AnimationContext';

const LazyPlayer = React.lazy(() =>
  import('./LottiePlayer').then((m) => ({ default: m.Player }))
);

interface Props {
  src: string | Record<string, unknown>;
  style?: React.CSSProperties;
  loop?: boolean;
  autoplay?: boolean;
  fallback?: React.ReactNode;
}

export function AnimatedIcon({
  src,
  fallback = null,
  loop = true,
  autoplay = true,
  style,
}: Props) {
  const { enabled } = useAnimation();

  if (!enabled) return <>{fallback}</>;

  return (
    <Suspense fallback={<>{fallback}</>}>
      <LazyPlayer src={src as string} loop={loop} autoplay={autoplay} style={style} />
    </Suspense>
  );
}
