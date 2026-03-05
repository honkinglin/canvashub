import type { CanvasRenderFunction } from '../../types';
import type { GradientConfig } from './types';



export const render: CanvasRenderFunction<GradientConfig> = (canvas, ctx, initialConfig) => {
  let config = { ...initialConfig };
  let animationId: number;
  let time = 0;

  const draw = () => {
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    // Moving radial gradients to simulate fluid/mesh gradient
    const t = time * 0.01;
    
    // Clear
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    ctx.globalCompositeOperation = 'screen';

    const drawBlob = (color: string, offsetX: number, offsetY: number, radiusRatio: number) => {
      const gradient = ctx.createRadialGradient(
        offsetX, offsetY, 0,
        offsetX, offsetY, Math.max(width, height) * radiusRatio * config.scale
      );
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    };

    // Blob 1
    const x1 = width * 0.5 + Math.sin(t) * width * 0.3;
    const y1 = height * 0.5 + Math.cos(t * 0.8) * height * 0.3;
    drawBlob(config.color1, x1, y1, 0.8);

    // Blob 2
    const x2 = width * 0.5 + Math.sin(t * 1.2 + Math.PI) * width * 0.3;
    const y2 = height * 0.5 + Math.cos(t * 0.9 + Math.PI) * height * 0.4;
    drawBlob(config.color2, x2, y2, 0.9);

    // Blob 3
    const x3 = width * 0.5 + Math.cos(t * 1.1) * width * 0.2;
    const y3 = height * 0.5 + Math.sin(t * 1.3) * height * 0.3;
    drawBlob(config.color3, x3, y3, 0.7);

    ctx.globalCompositeOperation = 'source-over';

    time += config.speed;
    animationId = requestAnimationFrame(draw);
  };

  draw();

  return {
    cleanup: () => cancelAnimationFrame(animationId),
    updateConfig: (newConfig) => {
      config = { ...newConfig };
    }
  };
};
