import { useEffect, useRef } from 'react';
import type { CanvasRenderFunction } from '../types';

interface CanvasBackgroundProps<T = any> {
  config: T;
  renderFn: CanvasRenderFunction<T>;
  className?: string;
}

export default function CanvasBackground<T>({ config, renderFn, className = '' }: CanvasBackgroundProps<T>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controllerRef = useRef<{ cleanup: () => void; updateConfig: (newConfig: T) => void } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let resizeObserver = new ResizeObserver((entries) => {
      if (!entries.length || !entries[0].target) return;
      const target = entries[0].target as HTMLElement;
      const dpr = window.devicePixelRatio || 1;
      const rect = target.getBoundingClientRect();
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(dpr, dpr);
      
      // Optionally notify controller of resize if needed,
      // but usually the render loop handles drawing to current canvas size.
    });

    const parent = canvas.parentElement;
    if (parent) {
      resizeObserver.observe(parent);
    }

    const controller = renderFn(canvas, ctx, config);
    controllerRef.current = controller;

    return () => {
      resizeObserver.disconnect();
      controller.cleanup();
      controllerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderFn]); 

  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.updateConfig(config);
    }
  }, [config]);

  return (
    <div className={`w-full h-full absolute inset-0 overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
