import type { CanvasRenderFunction } from '../../types';
import type { StardustBurstConfig } from './types';

interface Rgb {
  r: number;
  g: number;
  b: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
  alphaDecay: number;
  color: Rgb;
}

const TAU = Math.PI * 2;

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
    return { r: 255, g: 255, b: 255 };
  }

  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
};

const varyColor = (base: Rgb, variation: number): Rgb => {
  const delta = clamp(variation, 0, 180) * 0.5;
  return {
    r: clamp(Math.round(base.r + randomBetween(-delta, delta)), 0, 255),
    g: clamp(Math.round(base.g + randomBetween(-delta, delta)), 0, 255),
    b: clamp(Math.round(base.b + randomBetween(-delta, delta)), 0, 255),
  };
};

const makePalette = (config: StardustBurstConfig): Rgb[] => [
  hexToRgb(config.colorA),
  hexToRgb(config.colorB),
  hexToRgb(config.colorC),
  hexToRgb(config.colorD),
];

export const render: CanvasRenderFunction<StardustBurstConfig> = (canvas, ctx, initialConfig) => {
  let config = { ...initialConfig };
  let animationId = 0;
  let width = 0;
  let height = 0;
  let lastTime = performance.now();
  let lastAutoBurst = performance.now();
  let sizeSignature = '';
  let palette = makePalette(config);

  const particles: Particle[] = [];

  const updateSize = () => {
    const dpr = window.devicePixelRatio || 1;
    width = canvas.width / dpr;
    height = canvas.height / dpr;
  };

  const createParticle = (x: number, y: number): Particle => {
    const angle = randomBetween(0, TAU);
    const speed = randomBetween(0.6, clamp(config.maxSpeed, 4, 80));
    const base = palette[Math.floor(Math.random() * palette.length)];

    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: randomBetween(0.8, clamp(config.maxParticleSize, 1, 20)),
      alpha: randomBetween(0.55, 1),
      alphaDecay: randomBetween(0.006, 0.024),
      color: varyColor(base, config.colorVariation),
    };
  };

  const spawnBurst = (x: number, y: number, countOverride?: number) => {
    if (width <= 1 || height <= 1) {
      return;
    }
    const count = countOverride ?? clamp(Math.round(config.particleCount), 80, 1800);
    for (let i = 0; i < count; i += 1) {
      particles.push(createParticle(x, y));
    }

    const hardLimit = Math.max(2400, count * 10);
    if (particles.length > hardLimit) {
      particles.splice(0, particles.length - hardLimit);
    }
  };

  const handlePointerDown = (event: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    spawnBurst(x, y);
  };

  const handleTouchStart = (event: TouchEvent) => {
    const touch = event.touches[0];
    if (!touch) return;
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    spawnBurst(x, y);
  };

  canvas.addEventListener('click', handlePointerDown);
  canvas.addEventListener('touchstart', handleTouchStart, { passive: true });

  const rebuild = () => {
    updateSize();
    sizeSignature = `${Math.round(width)}x${Math.round(height)}`;
    if (width <= 1 || height <= 1) {
      return;
    }
    palette = makePalette(config);
    particles.length = 0;
    spawnBurst(width * 0.5, height * 0.5);
  };

  rebuild();

  const draw = (now: number) => {
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    const frameScale = dt * 60;
    lastTime = now;

    updateSize();
    const nextSignature = `${Math.round(width)}x${Math.round(height)}`;
    if (nextSignature !== sizeSignature) {
      rebuild();
    }
    if (width <= 1 || height <= 1) {
      animationId = requestAnimationFrame(draw);
      return;
    }

    const bg = hexToRgb(config.backgroundColor);
    ctx.fillStyle = `rgba(${bg.r}, ${bg.g}, ${bg.b}, ${clamp(config.backgroundFade, 0.04, 1)})`;
    ctx.fillRect(0, 0, width, height);

    if (config.autoBurst) {
      const interval = clamp(config.autoBurstInterval, 200, 4000);
      if (now - lastAutoBurst >= interval) {
        lastAutoBurst = now;
        const px = width * 0.5 + randomBetween(-width * 0.15, width * 0.15);
        const py = height * 0.5 + randomBetween(-height * 0.15, height * 0.15);
        spawnBurst(px, py, Math.max(20, Math.round(config.particleCount * 0.45)));
      }
    }

    const frictionPow = Math.pow(clamp(config.friction, 0.85, 0.999), frameScale);
    const gravity = clamp(config.gravity, -0.2, 0.4) * frameScale;

    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const p = particles[i];
      p.vx *= frictionPow;
      p.vy = p.vy * frictionPow + gravity;
      p.x += p.vx * frameScale;
      p.y += p.vy * frameScale;
      p.alpha -= p.alphaDecay * frameScale;

      if (
        p.alpha <= 0 ||
        p.x < -120 ||
        p.x > width + 120 ||
        p.y < -120 ||
        p.y > height + 120
      ) {
        particles.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, TAU);
      ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${clamp(p.alpha, 0, 1)})`;
      ctx.fill();
    }

    animationId = requestAnimationFrame(draw);
  };

  animationId = requestAnimationFrame(draw);

  return {
    cleanup: () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener('click', handlePointerDown);
      canvas.removeEventListener('touchstart', handleTouchStart);
    },
    updateConfig: (newConfig) => {
      const prev = config;
      config = { ...newConfig };

      const rebuildRequired =
        prev.backgroundColor !== config.backgroundColor ||
        prev.colorA !== config.colorA ||
        prev.colorB !== config.colorB ||
        prev.colorC !== config.colorC ||
        prev.colorD !== config.colorD;

      if (rebuildRequired) {
        palette = makePalette(config);
      }

      if (prev.particleCount !== config.particleCount) {
        spawnBurst(width * 0.5, height * 0.5, Math.max(20, Math.round(config.particleCount * 0.25)));
      }
    },
  };
};
