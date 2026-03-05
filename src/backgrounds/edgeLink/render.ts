import type { CanvasRenderFunction } from '../../types';
import type { EdgeLinkConfig } from './types';

interface Rgb {
  r: number;
  g: number;
  b: number;
}

interface Dot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  phase: number;
  type?: 'mouse';
}

type Side = 'top' | 'right' | 'bottom' | 'left';

const TAU = Math.PI * 2;
const SIDES: Side[] = ['top', 'right', 'bottom', 'left'];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

const hexToRgb = (hex: string): Rgb => {
  const normalized = hex.trim().replace('#', '');
  const full =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => char + char)
          .join('')
      : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    return { r: 156, g: 156, b: 156 };
  }

  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
};

const randomSide = (): Side => SIDES[Math.floor(Math.random() * SIDES.length)];

const randomSpeed = (side: Side, minSpeed: number, maxSpeed: number): [number, number] => {
  const min = Math.max(0.01, minSpeed);
  const max = Math.max(min + 0.01, maxSpeed);
  const rand = () => randomBetween(min, max);

  switch (side) {
    case 'top':
      return [randomBetween(-max, max), rand()];
    case 'right':
      return [-rand(), randomBetween(-max, max)];
    case 'bottom':
      return [randomBetween(-max, max), -rand()];
    case 'left':
    default:
      return [rand(), randomBetween(-max, max)];
  }
};

const createDotFromSide = (width: number, height: number, config: EdgeLinkConfig): Dot => {
  const side = randomSide();
  const pad = clamp(config.spawnPadding, 0, 24);
  const [vx, vy] = randomSpeed(side, config.speedMin, config.speedMax);

  switch (side) {
    case 'top':
      return { x: randomBetween(0, width), y: -pad, vx, vy, alpha: 1, phase: randomBetween(0, 10) };
    case 'right':
      return { x: width + pad, y: randomBetween(0, height), vx, vy, alpha: 1, phase: randomBetween(0, 10) };
    case 'bottom':
      return { x: randomBetween(0, width), y: height + pad, vx, vy, alpha: 1, phase: randomBetween(0, 10) };
    case 'left':
    default:
      return { x: -pad, y: randomBetween(0, height), vx, vy, alpha: 1, phase: randomBetween(0, 10) };
  }
};

const createDotInViewport = (width: number, height: number, config: EdgeLinkConfig): Dot => {
  const side = randomSide();
  const [vx, vy] = randomSpeed(side, config.speedMin, config.speedMax);
  return {
    x: randomBetween(0, width),
    y: randomBetween(0, height),
    vx,
    vy,
    alpha: 1,
    phase: randomBetween(0, 10),
  };
};

export const render: CanvasRenderFunction<EdgeLinkConfig> = (canvas, ctx, initialConfig) => {
  let config = { ...initialConfig };
  let animationId = 0;
  let width = 0;
  let height = 0;
  let sizeSignature = '';

  let dots: Dot[] = [];
  const mouseDot: Dot = { x: 0, y: 0, vx: 0, vy: 0, alpha: 1, phase: 0, type: 'mouse' };
  let mouseIn = false;

  const updateSize = () => {
    const dpr = window.devicePixelRatio || 1;
    width = canvas.width / dpr;
    height = canvas.height / dpr;
  };

  const syncDotCount = (preferViewportSpawn = false) => {
    const count = clamp(Math.round(config.ballCount), 8, 180);
    dots = dots.filter((dot) => dot.type !== 'mouse');
    while (dots.length < count) {
      dots.push(preferViewportSpawn ? createDotInViewport(width, height, config) : createDotFromSide(width, height, config));
    }
    if (dots.length > count) {
      dots.length = count;
    }
    if (config.enableMouseNode && mouseIn) {
      dots.push(mouseDot);
    }
  };

  const rebuild = () => {
    updateSize();
    sizeSignature = `${Math.round(width)}x${Math.round(height)}`;
    dots = [];
    syncDotCount(true);
  };

  const isInsideBounds = (dot: Dot) => {
    const bound = clamp(config.boundsPadding, 10, 180);
    return dot.x > -bound && dot.x < width + bound && dot.y > -bound && dot.y < height + bound;
  };

  const onMouseEnter = () => {
    mouseIn = true;
    syncDotCount();
  };

  const onMouseLeave = () => {
    mouseIn = false;
    dots = dots.filter((dot) => dot.type !== 'mouse');
  };

  const onMouseMove = (event: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    mouseDot.x = event.clientX - rect.left;
    mouseDot.y = event.clientY - rect.top;
  };

  const onTouchMove = (event: TouchEvent) => {
    const touch = event.touches[0];
    if (!touch) return;
    const rect = canvas.getBoundingClientRect();
    mouseDot.x = touch.clientX - rect.left;
    mouseDot.y = touch.clientY - rect.top;
    if (!mouseIn) {
      mouseIn = true;
      syncDotCount();
    }
  };

  const onTouchEnd = () => {
    mouseIn = false;
    dots = dots.filter((dot) => dot.type !== 'mouse');
  };

  canvas.addEventListener('mouseenter', onMouseEnter);
  canvas.addEventListener('mouseleave', onMouseLeave);
  canvas.addEventListener('mousemove', onMouseMove, { passive: true });
  canvas.addEventListener('touchmove', onTouchMove, { passive: true });
  canvas.addEventListener('touchend', onTouchEnd);

  rebuild();

  const draw = () => {
    updateSize();
    const nextSignature = `${Math.round(width)}x${Math.round(height)}`;
    if (nextSignature !== sizeSignature) {
      rebuild();
    }
    if (width <= 1 || height <= 1) {
      animationId = requestAnimationFrame(draw);
      return;
    }

    const node = hexToRgb(config.nodeColor);
    const line = hexToRgb(config.lineColor);
    const radius = clamp(config.ballRadius, 0.5, 8);
    const pulseSpeed = clamp(config.pulseSpeed, 0.005, 0.12);
    const distanceLimit = clamp(config.distanceLimit, 40, 520);

    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, width, height);

    const nextDots: Dot[] = [];
    for (const dot of dots) {
      if (dot.type !== 'mouse') {
        dot.x += dot.vx;
        dot.y += dot.vy;
        dot.phase += pulseSpeed;
        dot.alpha = Math.abs(Math.cos(dot.phase));
      }

      if (dot.type === 'mouse' || isInsideBounds(dot)) {
        nextDots.push(dot);
      }
    }
    dots = nextDots;
    syncDotCount();

    const distanceLimitSq = distanceLimit * distanceLimit;
    ctx.lineWidth = clamp(config.lineWidth, 0.2, 3);

    for (let i = 0; i < dots.length; i += 1) {
      for (let j = i + 1; j < dots.length; j += 1) {
        const a = dots[i];
        const b = dots[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < distanceLimitSq) {
          const alpha = 1 - Math.sqrt(distSq) / distanceLimit;
          ctx.strokeStyle = `rgba(${line.r}, ${line.g}, ${line.b}, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    for (const dot of dots) {
      if (dot.type === 'mouse') {
        continue;
      }
      ctx.fillStyle = `rgba(${node.r}, ${node.g}, ${node.b}, ${dot.alpha})`;
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, radius, 0, TAU);
      ctx.fill();
    }

    animationId = requestAnimationFrame(draw);
  };

  animationId = requestAnimationFrame(draw);

  return {
    cleanup: () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener('mouseenter', onMouseEnter);
      canvas.removeEventListener('mouseleave', onMouseLeave);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
    },
    updateConfig: (newConfig) => {
      const prev = config;
      config = { ...newConfig };

      const rebuildNeeded =
        prev.ballCount !== config.ballCount ||
        prev.speedMin !== config.speedMin ||
        prev.speedMax !== config.speedMax ||
        prev.spawnPadding !== config.spawnPadding;

      if (rebuildNeeded) {
        syncDotCount();
      }

      if (prev.enableMouseNode !== config.enableMouseNode && !config.enableMouseNode) {
        dots = dots.filter((dot) => dot.type !== 'mouse');
      }
    },
  };
};
