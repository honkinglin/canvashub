import type { CanvasRenderFunction } from '../../types';
import type { MagicDustConfig } from './types';

interface Rgb {
  r: number;
  g: number;
  b: number;
}

interface Dust {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  sizeStart: number;
  sizeEnd: number;
  fadeIn: number;
  fadeOut: number;
  rotation: number;
  rotationVelocity: number;
  color: Rgb;
  ambient: boolean;
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

const pickColor = (palette: Rgb[]) => palette[Math.floor(Math.random() * palette.length)];

export const render: CanvasRenderFunction<MagicDustConfig> = (canvas, ctx, initialConfig) => {
  let config = { ...initialConfig };
  let palette = [hexToRgb(config.colorA), hexToRgb(config.colorB), hexToRgb(config.colorC)];

  let animationId = 0;
  let lastTime = performance.now();
  let lastSpawnAt = 0;
  let width = 0;
  let height = 0;
  let sizeSignature = '';
  let pointerX = 0;
  let pointerY = 0;

  const dusts: Dust[] = [];

  const updateSize = () => {
    const dpr = window.devicePixelRatio || 1;
    width = canvas.width / dpr;
    height = canvas.height / dpr;
  };

  const createDust = (x: number, y: number, ambient: boolean): Dust => {
    const speedMin = clamp(config.speedMin, 0.1, 20);
    const speedMax = clamp(config.speedMax, speedMin + 0.1, 40);
    const lifeMin = clamp(config.lifeMin, 0.2, 8);
    const lifeMax = clamp(config.lifeMax, lifeMin + 0.1, 14);
    const sizeMin = clamp(config.sizeMin, 2, 80);
    const sizeMax = clamp(config.sizeMax, sizeMin + 1, 140);

    const angle = randomBetween(0, TAU);
    const velocity = ambient ? randomBetween(speedMin * 0.05, speedMax * 0.2) : randomBetween(speedMin, speedMax);
    const sizeStart = ambient ? randomBetween(sizeMin * 0.35, sizeMin * 0.8) : randomBetween(sizeMin * 0.6, sizeMax * 0.95);
    const sizeEnd = ambient ? randomBetween(sizeStart * 0.3, sizeStart * 0.8) : randomBetween(sizeMin * 0.2, sizeStart * 0.7);
    const life = ambient ? randomBetween(lifeMin * 2, lifeMax * 2.4) : randomBetween(lifeMin, lifeMax);

    return {
      x,
      y,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      age: 0,
      life,
      sizeStart,
      sizeEnd,
      fadeIn: ambient ? 0.2 : randomBetween(0.08, 0.3),
      fadeOut: ambient ? 0.4 : randomBetween(0.8, 1.8),
      rotation: randomBetween(0, 360),
      rotationVelocity: randomBetween(-220, 220),
      color: pickColor(palette),
      ambient,
    };
  };

  const spawnAmbient = () => {
    const target = clamp(Math.round(config.ambientCount), 0, 1800);
    const ambientNow = dusts.filter((d) => d.ambient).length;
    for (let i = ambientNow; i < target; i += 1) {
      dusts.push(createDust(randomBetween(0, width), randomBetween(0, height), true));
    }
  };

  const spawnBurst = (x: number, y: number, count: number) => {
    for (let i = 0; i < count; i += 1) {
      dusts.push(createDust(x, y, false));
    }
    if (dusts.length > 4000) {
      dusts.splice(0, dusts.length - 4000);
    }
  };

  const onPointerMove = (x: number, y: number) => {
    const rect = canvas.getBoundingClientRect();
    pointerX = x - rect.left;
    pointerY = y - rect.top;
    const now = performance.now();
    if (now - lastSpawnAt >= clamp(config.spawnInterval, 4, 120)) {
      lastSpawnAt = now;
      spawnBurst(pointerX, pointerY, clamp(Math.round(config.burstCount), 1, 40));
    }
  };

  const onMouseMove = (event: MouseEvent) => onPointerMove(event.clientX, event.clientY);
  const onTouchMove = (event: TouchEvent) => {
    const touch = event.touches[0];
    if (!touch) return;
    onPointerMove(touch.clientX, touch.clientY);
  };

  canvas.addEventListener('mousemove', onMouseMove, { passive: true });
  canvas.addEventListener('touchmove', onTouchMove, { passive: true });

  const rebuild = (hard = false) => {
    updateSize();
    sizeSignature = `${Math.round(width)}x${Math.round(height)}`;
    pointerX = width * 0.5;
    pointerY = height * 0.5;
    if (hard) {
      dusts.length = 0;
    }
    spawnAmbient();
  };

  rebuild(true);

  const draw = (now: number) => {
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    const frameScale = dt * 60;
    lastTime = now;

    updateSize();
    const nextSignature = `${Math.round(width)}x${Math.round(height)}`;
    if (nextSignature !== sizeSignature) {
      rebuild(true);
    }
    if (width <= 1 || height <= 1) {
      animationId = requestAnimationFrame(draw);
      return;
    }

    const bg = hexToRgb(config.backgroundColor);
    ctx.fillStyle = `rgba(${bg.r}, ${bg.g}, ${bg.b}, ${clamp(config.trailFade, 0.02, 1)})`;
    ctx.fillRect(0, 0, width, height);

    const gravity = clamp(config.gravity, -1, 2);
    const glow = clamp(config.glowStrength, 0.1, 3);

    for (let i = dusts.length - 1; i >= 0; i -= 1) {
      const d = dusts[i];
      d.age += dt;
      d.vy += gravity * dt;
      d.x += d.vx * frameScale;
      d.y += d.vy * frameScale;
      d.rotation += d.rotationVelocity * dt;

      const t = clamp(d.age / Math.max(0.001, d.life), 0, 1);
      const size = d.sizeStart + (d.sizeEnd - d.sizeStart) * t;

      let alpha = 1;
      if (t < d.fadeIn) {
        alpha = t / Math.max(0.001, d.fadeIn);
      } else if (t > d.fadeOut) {
        alpha = 1 - (t - d.fadeOut) / Math.max(0.001, 1 - d.fadeOut);
      }
      alpha = clamp(alpha, 0, 1);

      if (
        alpha <= 0 ||
        d.x < -140 ||
        d.x > width + 140 ||
        d.y < -140 ||
        d.y > height + 140
      ) {
        if (d.ambient) {
          dusts[i] = createDust(randomBetween(0, width), randomBetween(0, height), true);
        } else {
          dusts.splice(i, 1);
        }
        continue;
      }

      const radius = Math.max(1, size * 0.5);
      const grad = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, radius * 1.4);
      grad.addColorStop(0, `rgba(${d.color.r}, ${d.color.g}, ${d.color.b}, ${alpha * 0.95})`);
      grad.addColorStop(0.16, `rgba(${d.color.r}, ${d.color.g}, ${d.color.b}, ${alpha * 0.24 * glow})`);
      grad.addColorStop(0.7, `rgba(${d.color.r}, ${d.color.g}, ${d.color.b}, ${alpha * 0.06 * glow})`);
      grad.addColorStop(1, `rgba(${d.color.r}, ${d.color.g}, ${d.color.b}, 0)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(d.x, d.y, radius * 1.4, 0, TAU);
      ctx.fill();
    }

    spawnAmbient();
    animationId = requestAnimationFrame(draw);
  };

  animationId = requestAnimationFrame(draw);

  return {
    cleanup: () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('touchmove', onTouchMove);
    },
    updateConfig: (newConfig) => {
      const prev = config;
      config = { ...newConfig };

      const paletteChanged =
        prev.colorA !== config.colorA ||
        prev.colorB !== config.colorB ||
        prev.colorC !== config.colorC;

      if (paletteChanged) {
        palette = [hexToRgb(config.colorA), hexToRgb(config.colorB), hexToRgb(config.colorC)];
        for (const d of dusts) {
          d.color = pickColor(palette);
        }
      }

      if (prev.ambientCount !== config.ambientCount) {
        const target = clamp(Math.round(config.ambientCount), 0, 1800);
        let ambientNow = dusts.filter((d) => d.ambient).length;
        if (ambientNow > target) {
          for (let i = dusts.length - 1; i >= 0 && ambientNow > target; i -= 1) {
            if (dusts[i].ambient) {
              dusts.splice(i, 1);
              ambientNow -= 1;
            }
          }
        }
      }
    },
  };
};
