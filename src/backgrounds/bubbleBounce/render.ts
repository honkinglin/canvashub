import type { CanvasRenderFunction } from '../../types';
import type { BubbleBounceConfig } from './types';

interface Circle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

export const render: CanvasRenderFunction<BubbleBounceConfig> = (canvas, ctx, initialConfig) => {
  let config = { ...initialConfig };
  let animationId = 0;
  let width = 0;
  let height = 0;
  let sizeSignature = '';
  let lastTime = performance.now();

  const circles: Circle[] = [];

  const palette = () => [config.colorA, config.colorB, config.colorC, config.colorD, config.colorE];

  const randomColor = () => {
    const colors = palette();
    return colors[Math.floor(Math.random() * colors.length)] ?? '#2885FF';
  };

  const updateSize = () => {
    const dpr = window.devicePixelRatio || 1;
    width = canvas.width / dpr;
    height = canvas.height / dpr;
  };

  const resetCircle = (circle: Circle, randomPosition: boolean) => {
    const minR = clamp(config.radiusMin, 2, 240);
    const maxR = clamp(config.radiusMax, minR + 1, 260);
    const speed = clamp(config.speed, 0.01, 30);

    const radius = randomBetween(minR, maxR);
    const direction = randomBetween(0, Math.PI * 2);
    const velocity = randomBetween(0.35, 1.0) * speed;

    circle.radius = radius;
    circle.vx = Math.cos(direction) * velocity;
    circle.vy = Math.sin(direction) * velocity;
    circle.color = randomColor();

    if (randomPosition) {
      circle.x = randomBetween(radius, Math.max(radius, width - radius));
      circle.y = randomBetween(radius, Math.max(radius, height - radius));
    } else {
      circle.x = clamp(circle.x, radius, Math.max(radius, width - radius));
      circle.y = clamp(circle.y, radius, Math.max(radius, height - radius));
    }
  };

  const syncCount = (resetAll: boolean) => {
    const target = clamp(Math.round(config.circleCount), 1, 600);

    while (circles.length < target) {
      const circle: Circle = {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radius: 8,
        color: '#2885FF',
      };
      resetCircle(circle, true);
      circles.push(circle);
    }

    if (circles.length > target) {
      circles.length = target;
    }

    if (resetAll) {
      for (let i = 0; i < circles.length; i += 1) {
        resetCircle(circles[i], true);
      }
    }
  };

  const rebuild = () => {
    updateSize();
    sizeSignature = `${Math.round(width)}x${Math.round(height)}:${Math.round(config.circleCount)}`;
    if (width <= 1 || height <= 1) return;
    syncCount(true);
  };

  rebuild();

  const drawFrame = (now: number) => {
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    const frameScale = dt * 60;
    lastTime = now;

    updateSize();
    const nextSignature = `${Math.round(width)}x${Math.round(height)}:${Math.round(config.circleCount)}`;
    if (nextSignature !== sizeSignature) {
      rebuild();
    }

    if (width <= 1 || height <= 1) {
      animationId = requestAnimationFrame(drawFrame);
      return;
    }

    syncCount(false);

    const strokeWidth = clamp(config.strokeWidth, 0.1, 20);
    const trailAlpha = clamp(config.trailAlpha, 0.02, 1);
    const bounceLoss = clamp(config.bounceLoss, 0.5, 1);

    if (trailAlpha >= 0.999) {
      ctx.fillStyle = config.backgroundColor;
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.fillStyle = config.backgroundColor;
      ctx.globalAlpha = trailAlpha;
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = 1;
    }

    ctx.lineWidth = strokeWidth;

    for (let i = 0; i < circles.length; i += 1) {
      const circle = circles[i];

      circle.x += circle.vx * frameScale;
      circle.y += circle.vy * frameScale;

      if (circle.x + circle.radius >= width) {
        circle.x = width - circle.radius;
        circle.vx = -Math.abs(circle.vx) * bounceLoss;
      } else if (circle.x - circle.radius <= 0) {
        circle.x = circle.radius;
        circle.vx = Math.abs(circle.vx) * bounceLoss;
      }

      if (circle.y + circle.radius >= height) {
        circle.y = height - circle.radius;
        circle.vy = -Math.abs(circle.vy) * bounceLoss;
      } else if (circle.y - circle.radius <= 0) {
        circle.y = circle.radius;
        circle.vy = Math.abs(circle.vy) * bounceLoss;
      }

      if (Math.abs(circle.vx) < 0.04) circle.vx = circle.vx < 0 ? -0.04 : 0.04;
      if (Math.abs(circle.vy) < 0.04) circle.vy = circle.vy < 0 ? -0.04 : 0.04;

      ctx.beginPath();
      ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
      ctx.strokeStyle = circle.color;
      ctx.stroke();
    }

    animationId = requestAnimationFrame(drawFrame);
  };

  animationId = requestAnimationFrame(drawFrame);

  return {
    cleanup: () => {
      cancelAnimationFrame(animationId);
    },
    updateConfig: (newConfig) => {
      const prev = config;
      config = { ...newConfig };

      const paletteChanged =
        prev.colorA !== config.colorA ||
        prev.colorB !== config.colorB ||
        prev.colorC !== config.colorC ||
        prev.colorD !== config.colorD ||
        prev.colorE !== config.colorE;

      if (paletteChanged) {
        for (let i = 0; i < circles.length; i += 1) {
          circles[i].color = randomColor();
        }
      }
    },
  };
};
