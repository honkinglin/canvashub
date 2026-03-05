import type { CanvasRenderFunction } from '../../types';
import type { ConfettiConfig } from './types';

interface Rgb {
  r: number;
  g: number;
  b: number;
}

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  opacity: number;
  dop: number;
  color: Rgb;
  seed: number;
}



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

const createPalette = (config: ConfettiConfig): Rgb[] => [
  hexToRgb(config.colorA),
  hexToRgb(config.colorB),
  hexToRgb(config.colorC),
  hexToRgb(config.colorD),
  hexToRgb(config.colorE),
];

const makeParticle = (palette: Rgb[]): ConfettiParticle => ({
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  r: 3,
  opacity: 0,
  dop: 0,
  color: palette[Math.floor(Math.random() * palette.length)],
  seed: Math.random() * Math.PI * 2,
});

const respawnParticle = (
  particle: ConfettiParticle,
  width: number,
  height: number,
  palette: Rgb[],
  config: ConfettiConfig,
  mouseNormX: number,
  fromTop: boolean
) => {
  const sizeMin = clamp(config.sizeMin, 1, 16);
  const sizeMax = clamp(config.sizeMax, sizeMin + 0.1, 24);
  const drift = clamp(config.horizontalDrift, 0, 5);

  particle.r = randomBetween(sizeMin, sizeMax);
  particle.opacity = fromTop ? randomBetween(0.05, 0.4) : randomBetween(0.35, 1);
  particle.dop = clamp(config.fadeSpeed, 0.005, 0.2) * randomBetween(0.8, 2.6);
  particle.x = randomBetween(-particle.r * 2, width - particle.r * 2);
  particle.y = fromTop ? randomBetween(-30, -particle.r * 2) : randomBetween(-particle.r * 2, height - particle.r * 2);
  particle.vx = randomBetween(-drift, drift) + (mouseNormX - 0.5) * clamp(config.mouseInfluence, 0, 4) * 5;
  particle.vy = clamp(config.fallSpeed, 0.2, 6) * randomBetween(0.55, 1.5) + particle.r * 0.08;
  particle.color = palette[Math.floor(Math.random() * palette.length)];
  particle.seed = Math.random() * Math.PI * 2;
};

export const render: CanvasRenderFunction<ConfettiConfig> = (canvas, ctx, initialConfig) => {
  let config = { ...initialConfig };
  let palette = createPalette(config);
  let animationId = 0;
  let lastTime = performance.now();
  let time = 0;
  let width = 0;
  let height = 0;
  let sizeSignature = '';
  const particles: ConfettiParticle[] = [];

  const pointer = {
    xNorm: 0.5,
    targetXNorm: 0.5,
    active: false,
  };

  const updateSize = () => {
    const dpr = window.devicePixelRatio || 1;
    width = canvas.width / dpr;
    height = canvas.height / dpr;
  };

  const syncCount = () => {
    if (width <= 1 || height <= 1) {
      return;
    }
    const count = clamp(Math.round(config.confettiCount), 20, 1200);
    while (particles.length < count) {
      const particle = makeParticle(palette);
      respawnParticle(particle, width, height, palette, config, pointer.xNorm, false);
      particles.push(particle);
    }
    if (particles.length > count) {
      particles.length = count;
    }
  };

  const rebuildAll = () => {
    updateSize();
    sizeSignature = `${Math.round(width)}x${Math.round(height)}`;
    if (width <= 1 || height <= 1) {
      return;
    }
    palette = createPalette(config);
    syncCount();
    for (const particle of particles) {
      respawnParticle(particle, width, height, palette, config, pointer.xNorm, false);
    }
  };

  const onMouseMove = (event: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    const localX = event.clientX - rect.left;
    pointer.targetXNorm = clamp(localX / Math.max(1, width), 0, 1);
    pointer.active = true;
  };

  const onTouchMove = (event: TouchEvent) => {
    const touch = event.touches[0];
    if (!touch) return;
    const rect = canvas.getBoundingClientRect();
    const localX = touch.clientX - rect.left;
    pointer.targetXNorm = clamp(localX / Math.max(1, width), 0, 1);
    pointer.active = true;
  };

  const onLeave = () => {
    pointer.active = false;
    pointer.targetXNorm = 0.5;
  };

  window.addEventListener('mousemove', onMouseMove, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: true });
  window.addEventListener('mouseleave', onLeave);
  window.addEventListener('touchend', onLeave);

  rebuildAll();

  const draw = (now: number) => {
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    time += dt;

    updateSize();
    const nextSignature = `${Math.round(width)}x${Math.round(height)}`;
    if (nextSignature !== sizeSignature) {
      rebuildAll();
    }
    if (width <= 1 || height <= 1) {
      animationId = requestAnimationFrame(draw);
      return;
    }
    syncCount();

    pointer.xNorm += (pointer.targetXNorm - pointer.xNorm) * (pointer.active ? 0.14 : 0.06);
    const mousePush = (pointer.xNorm - 0.5) * clamp(config.mouseInfluence, 0, 4);
    const drift = clamp(config.horizontalDrift, 0, 5);

    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, width, height);

    const frameScale = dt * 60;
    for (const particle of particles) {
      const wind = Math.sin(time * 0.65 + particle.seed) * drift * 0.03;
      const attraction = ((pointer.xNorm * width - particle.x) / Math.max(1, width)) * clamp(config.mouseInfluence, 0, 4) * 2.1;
      const targetVx = randomBetween(-drift, drift) * 0.2 + mousePush * 1.15 + attraction;
      particle.vx += (targetVx - particle.vx) * 0.025 * frameScale;
      particle.vx += wind * frameScale;

      particle.x += particle.vx * frameScale;
      particle.y += particle.vy * frameScale;

      particle.opacity += particle.dop * frameScale * 0.35;
      if (particle.opacity > 1) {
        particle.opacity = 1;
        particle.dop *= -1;
      }
      if (particle.opacity < 0.2) {
        particle.opacity = 0.2;
        particle.dop = Math.abs(particle.dop);
      }

      if (particle.y > height + particle.r * 2) {
        respawnParticle(particle, width, height, palette, config, pointer.xNorm, true);
      }

      if (particle.x < -particle.r * 2) {
        particle.x = width + particle.r;
      } else if (particle.x > width + particle.r * 2) {
        particle.x = -particle.r;
      }

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${clamp(particle.opacity, 0, 1)})`;
      ctx.fill();
    }

    animationId = requestAnimationFrame(draw);
  };

  animationId = requestAnimationFrame(draw);

  return {
    cleanup: () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('touchend', onLeave);
    },
    updateConfig: (newConfig) => {
      const prev = config;
      config = { ...newConfig };

      const countChanged = prev.confettiCount !== config.confettiCount;
      const paletteChanged =
        prev.colorA !== config.colorA ||
        prev.colorB !== config.colorB ||
        prev.colorC !== config.colorC ||
        prev.colorD !== config.colorD ||
        prev.colorE !== config.colorE;
      const sizeChanged = prev.sizeMin !== config.sizeMin || prev.sizeMax !== config.sizeMax;

      if (paletteChanged) {
        palette = createPalette(config);
      }
      if (countChanged || paletteChanged || sizeChanged) {
        rebuildAll();
      }
    },
  };
};
