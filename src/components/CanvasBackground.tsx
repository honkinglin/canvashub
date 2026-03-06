import { useEffect, useRef, useState } from 'react';
import type { CanvasRenderFunction, ConfigRecord } from '../types';

interface CanvasBackgroundProps<T = ConfigRecord> {
  config: T;
  renderFn: CanvasRenderFunction<T>;
  className?: string;
  pauseWhenOffscreen?: boolean;
  offscreenRootMargin?: string;
}

export default function CanvasBackground<T>({
  config,
  renderFn,
  className = '',
  pauseWhenOffscreen = false,
  offscreenRootMargin = '220px',
}: CanvasBackgroundProps<T>) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controllerRef = useRef<{ cleanup: () => void; updateConfig: (newConfig: T) => void } | null>(null);
  const [isVisible, setIsVisible] = useState(!pauseWhenOffscreen);
  const shouldRun = !pauseWhenOffscreen || isVisible;

  useEffect(() => {
    if (!pauseWhenOffscreen) {
      setIsVisible(true);
      return;
    }

    const element = wrapperRef.current;
    if (!element) return;

    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsVisible(Boolean(entry?.isIntersecting));
      },
      { root: null, rootMargin: offscreenRootMargin, threshold: 0.01 }
    );
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [pauseWhenOffscreen, offscreenRootMargin]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries.length || !entries[0].target) return;
      const target = entries[0].target as HTMLElement;
      const dpr = window.devicePixelRatio || 1;
      const rect = target.getBoundingClientRect();
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      
      // Optionally notify controller of resize if needed,
      // but usually the render loop handles drawing to current canvas size.
    });

    const parent = canvas.parentElement;
    if (parent) {
      resizeObserver.observe(parent);
    }

    if (!shouldRun) {
      if (controllerRef.current) {
        controllerRef.current.cleanup();
        controllerRef.current = null;
      }
      return () => {
        resizeObserver.disconnect();
      };
    }

    const controller = renderFn(canvas, ctx, config);
    controllerRef.current = controller;

    return () => {
      resizeObserver.disconnect();
      controller.cleanup();
      controllerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderFn, shouldRun]);

  useEffect(() => {
    if (shouldRun && controllerRef.current) {
      controllerRef.current.updateConfig(config);
    }
  }, [config, shouldRun]);

  return (
    <div ref={wrapperRef} className={`w-full h-full absolute inset-0 overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
