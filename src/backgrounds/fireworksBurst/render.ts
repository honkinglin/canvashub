import type { CanvasRenderFunction } from '../../types';
import type { FireworksBurstConfig } from './types';

interface Rgb {
  r: number;
  g: number;
  b: number;
}

interface Particle {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  startRadius: number;
  color: Rgb;
}

interface Ring {
  maxRadius: number;
  startLineWidth: number;
  startAlpha: number;
  color: Rgb;
}

interface Burst {
  x: number;
  y: number;
  startTime: number;
  duration: number;
  particles: Particle[];
  ring: Ring;
}

const TAU = Math.PI * 2;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

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

const makePalette = (config: FireworksBurstConfig): Rgb[] => [
  hexToRgb(config.colorA),
  hexToRgb(config.colorB),
  hexToRgb(config.colorC),
  hexToRgb(config.colorD),
];

export const render: CanvasRenderFunction<FireworksBurstConfig> = (canvas, ctx, initialConfig) => {
  let config = { ...initialConfig };
  let palette = makePalette(config);
  let animationId = 0;
  let width = 0;
  let height = 0;
  let sizeSignature = '';
  let interacted = false;
  let lastAutoBurst = performance.now();

  const bursts: Burst[] = [];

  const updateSize = () => {
    const dpr = window.devicePixelRatio || 1;
    width = canvas.width / dpr;
    height = canvas.height / dpr;
  };

  const createBurst = (x: number, y: number, now: number) => {
    const particleCount = clamp(Math.round(config.particleCount), 8, 120);
    const radiusMin = clamp(config.particleRadiusMin, 1, 60);
    const radiusMax = clamp(config.particleRadiusMax, radiusMin + 0.1, 80);
    const spreadMin = clamp(config.spreadMin, 10, 320);
    const spreadMax = clamp(config.spreadMax, spreadMin + 1, 420);
    const durationMin = clamp(config.durationMin, 200, 4000);
    const durationMax = clamp(config.durationMax, durationMin + 10, 5000);
    const ringRadiusMin = clamp(config.ringRadiusMin, 20, 320);
    const ringRadiusMax = clamp(config.ringRadiusMax, ringRadiusMin + 1, 420);

    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i += 1) {
      const angle = randomBetween(0, TAU);
      const spread = randomBetween(spreadMin, spreadMax);
      const endX = x + Math.cos(angle) * spread;
      const endY = y + Math.sin(angle) * spread;
      particles.push({
        startX: x,
        startY: y,
        endX,
        endY,
        startRadius: randomBetween(radiusMin, radiusMax),
        color: palette[Math.floor(Math.random() * palette.length)],
      });
    }

    const ring: Ring = {
      maxRadius: randomBetween(ringRadiusMin, ringRadiusMax),
      startLineWidth: clamp(config.ringLineWidth, 0.1, 24),
      startAlpha: 0.5,
      color: { r: 255, g: 255, b: 255 },
    };

    bursts.push({
      x,
      y,
      startTime: now,
      duration: randomBetween(durationMin, durationMax),
      particles,
      ring,
    });
  };

  const pointerBurst = (event: MouseEvent | TouchEvent) => {
    interacted = true;
    const rect = canvas.getBoundingClientRect();
    const point = 'touches' in event ? event.touches[0] : event;
    if (!point) return;
    const x = point.clientX - rect.left;
    const y = point.clientY - rect.top;
    createBurst(x, y, performance.now());
  };

  const onClick = (event: MouseEvent) => pointerBurst(event);
  const onTouchStart = (event: TouchEvent) => pointerBurst(event);

  canvas.addEventListener('mousedown', onClick);
  canvas.addEventListener('touchstart', onTouchStart, { passive: true });

  const rebuild = () => {
    updateSize();
    sizeSignature = `${Math.round(width)}x${Math.round(height)}`;
    if (width <= 1 || height <= 1) return;

    bursts.length = 0;
    createBurst(width * 0.5, height * 0.5, performance.now());
  };

  rebuild();

  const draw = (now: number) => {
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
    ctx.fillStyle = `rgba(${bg.r}, ${bg.g}, ${bg.b}, ${clamp(config.fadeAlpha, 0.02, 1)})`;
    ctx.fillRect(0, 0, width, height);

    if (config.autoBurst && (!config.stopAutoOnInteract || !interacted)) {
      const interval = clamp(config.autoBurstInterval, 80, 2000);
      if (now - lastAutoBurst >= interval) {
        lastAutoBurst = now;
        const jitter = clamp(config.autoBurstJitter, 0, 300);
        createBurst(
          width * 0.5 + randomBetween(-jitter, jitter),
          height * 0.5 + randomBetween(-jitter, jitter),
          now
        );
      }
    }

    for (let i = bursts.length - 1; i >= 0; i -= 1) {
      const burst = bursts[i];
      const raw = (now - burst.startTime) / Math.max(1, burst.duration);
      const t = clamp(raw, 0, 1);
      const eased = easeOutExpo(t);

      for (const particle of burst.particles) {
        const x = particle.startX + (particle.endX - particle.startX) * eased;
        const y = particle.startY + (particle.endY - particle.startY) * eased;
        const r = Math.max(0.1, particle.startRadius * (1 - t));

        ctx.beginPath();
        ctx.arc(x, y, r, 0, TAU);
        ctx.fillStyle = `rgb(${particle.color.r}, ${particle.color.g}, ${particle.color.b})`;
        ctx.fill();
      }

      const ringRadius = burst.ring.maxRadius * eased;
      const ringLineWidth = burst.ring.startLineWidth * (1 - t);
      const ringAlpha = burst.ring.startAlpha * (1 - t);
      if (ringLineWidth > 0.05 && ringAlpha > 0.01) {
        ctx.globalAlpha = ringAlpha;
        ctx.beginPath();
        ctx.arc(burst.x, burst.y, ringRadius, 0, TAU);
        ctx.lineWidth = ringLineWidth;
        ctx.strokeStyle = `rgb(${burst.ring.color.r}, ${burst.ring.color.g}, ${burst.ring.color.b})`;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      if (t >= 1) {
        bursts.splice(i, 1);
      }
    }

    animationId = requestAnimationFrame(draw);
  };

  animationId = requestAnimationFrame(draw);

  return {
    cleanup: () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener('mousedown', onClick);
      canvas.removeEventListener('touchstart', onTouchStart);
    },
    updateConfig: (newConfig) => {
      const prev = config;
      config = { ...newConfig };

      const paletteChanged =
        prev.colorA !== config.colorA ||
        prev.colorB !== config.colorB ||
        prev.colorC !== config.colorC ||
        prev.colorD !== config.colorD;

      if (paletteChanged) {
        palette = makePalette(config);
      }
    },
  };
};
