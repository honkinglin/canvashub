import type { CanvasRenderFunction } from '../../types';
import type { StarfieldWarpConfig } from './types';

interface Rgb {
  r: number;
  g: number;
  b: number;
}

interface Star {
  x: number;
  y: number;
  z: number;
  opacity: number;
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
    return { r: 209, g: 255, b: 255 };
  }

  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
};

const createStar = (width: number, height: number, depth: number, minOpacity: number, maxOpacity: number): Star => ({
  x: randomBetween(0, width),
  y: randomBetween(0, height),
  z: randomBetween(1, Math.max(2, width * depth)),
  opacity: randomBetween(minOpacity, maxOpacity),
});

export const render: CanvasRenderFunction<StarfieldWarpConfig> = (canvas, ctx, initialConfig) => {
  let config = { ...initialConfig };
  let animationId = 0;
  let lastTime = performance.now();
  let width = 0;
  let height = 0;
  let centerX = 0;
  let centerY = 0;
  let sizeSignature = '';

  let stars: Star[] = [];

  const updateSize = () => {
    const dpr = window.devicePixelRatio || 1;
    width = canvas.width / dpr;
    height = canvas.height / dpr;
    centerX = width * 0.5;
    centerY = height * 0.5;
  };

  const rebuild = (reset = true) => {
    updateSize();
    sizeSignature = `${Math.round(width)}x${Math.round(height)}`;
    if (width <= 1 || height <= 1) return;

    const count = clamp(Math.round(config.starCount), 100, 5000);
    const minOpacity = clamp(config.minOpacity, 0.01, 0.95);
    const maxOpacity = clamp(config.maxOpacity, minOpacity + 0.01, 1);
    const depth = clamp(config.maxDepth, 0.4, 3);

    if (reset) {
      stars = Array.from({ length: count }, () => createStar(width, height, depth, minOpacity, maxOpacity));
      return;
    }

    while (stars.length < count) {
      stars.push(createStar(width, height, depth, minOpacity, maxOpacity));
    }
    if (stars.length > count) {
      stars.length = count;
    }
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
    const fade = config.warpEnabled ? clamp(config.trailFade, 0.01, 1) : 1;
    ctx.fillStyle = `rgba(${bg.r}, ${bg.g}, ${bg.b}, ${fade})`;
    ctx.fillRect(0, 0, width, height);

    const starColor = hexToRgb(config.starColor);
    const baseSpeed = clamp(config.baseSpeed, 0.1, 6);
    const warpSpeed = config.warpEnabled ? clamp(config.warpSpeed, 1, 20) : 1;
    const speed = baseSpeed * warpSpeed;
    const focalLength = width * clamp(config.focalLength, 0.8, 6);
    const depth = clamp(config.maxDepth, 0.4, 3);
    const maxDepthDistance = Math.max(2, width * depth);
    const sizeBase = clamp(config.starSize, 0.2, 3);
    const minOpacity = clamp(config.minOpacity, 0.01, 0.95);
    const maxOpacity = clamp(config.maxOpacity, minOpacity + 0.01, 1);

    for (const star of stars) {
      const previousZ = star.z;
      star.z -= speed * frameScale;
      let wrapped = false;
      if (star.z <= 1) {
        star.x = randomBetween(0, width);
        star.y = randomBetween(0, height);
        star.z = maxDepthDistance;
        star.opacity = randomBetween(minOpacity, maxOpacity);
        wrapped = true;
      }

      const scale = focalLength / star.z;
      const px = (star.x - centerX) * scale + centerX;
      const py = (star.y - centerY) * scale + centerY;
      const radius = sizeBase * scale;

      if (px < -30 || px > width + 30 || py < -30 || py > height + 30) {
        star.x = randomBetween(0, width);
        star.y = randomBetween(0, height);
        star.z = maxDepthDistance;
        star.opacity = randomBetween(minOpacity, maxOpacity);
        continue;
      }

      if (config.warpEnabled && !wrapped) {
        const prevScale = focalLength / Math.max(1, previousZ);
        const prevX = (star.x - centerX) * prevScale + centerX;
        const prevY = (star.y - centerY) * prevScale + centerY;
        const trailAlpha = star.opacity * clamp(0.2 + speed * 0.04, 0.25, 0.75);
        ctx.strokeStyle = `rgba(${starColor.r}, ${starColor.g}, ${starColor.b}, ${trailAlpha})`;
        ctx.lineWidth = Math.max(0.2, radius * 0.48);
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(px, py);
        ctx.stroke();
      }

      const coreRadius = Math.max(0.22, radius * 0.72);
      // Only near/bright stars get a subtle glow to avoid visible ring artifacts.
      if (coreRadius > 0.65) {
        const glowRadius = coreRadius * 1.55;
        ctx.fillStyle = `rgba(${starColor.r}, ${starColor.g}, ${starColor.b}, ${star.opacity * 0.14})`;
        ctx.beginPath();
        ctx.arc(px, py, glowRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = `rgba(${starColor.r}, ${starColor.g}, ${starColor.b}, ${star.opacity})`;
      ctx.beginPath();
      ctx.arc(px, py, coreRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    animationId = requestAnimationFrame(draw);
  };

  animationId = requestAnimationFrame(draw);

  return {
    cleanup: () => {
      cancelAnimationFrame(animationId);
    },
    updateConfig: (newConfig) => {
      const prev = config;
      config = { ...newConfig };

      const needFullReset =
        prev.starCount !== config.starCount ||
        prev.maxDepth !== config.maxDepth ||
        prev.minOpacity !== config.minOpacity ||
        prev.maxOpacity !== config.maxOpacity;

      if (needFullReset) {
        rebuild(false);
      }
    },
  };
};
