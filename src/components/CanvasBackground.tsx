import { useEffect, useRef } from 'react';
import type { BackgroundDefinition, Config } from '../types/canvas';

interface Props {
  background: BackgroundDefinition<Config>;
  config: Config;
  className?: string;
}

export function CanvasBackground({ background, config, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cleanup = background.render(canvas, config);
    return cleanup;
  }, [background, config]);

  return <canvas ref={canvasRef} className={className} style={{ width: '100%', height: '100%' }} />;
}
