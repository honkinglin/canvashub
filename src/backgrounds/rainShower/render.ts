import type { CanvasRenderFunction } from '../../types';
import type { RainShowerConfig } from './types';

interface Rgb {
  r: number;
  g: number;
  b: number;
}

interface RainParticle {
  x: number;
  y: number;
  z: number;
  speedFactor: number;
  splashed: boolean;
}

interface DropParticle {
  x: number;
  y: number;
  radius: number;
  speedX: number;
  speedY: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

const hexToRgb = (hex: string, fallback: Rgb): Rgb => {
  const normalized = hex.trim().replace('#', '');
  const full =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => char + char)
          .join('')
      : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    return fallback;
  }

  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
};

export const render: CanvasRenderFunction<RainShowerConfig> = (canvas, ctx, initialConfig) => {
  let config = { ...initialConfig };
  let animationId = 0;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let sizeSignature = '';
  let lastTime = performance.now();
  let spawnAccumulator = 0;

  let rainColorRgb = hexToRgb(config.rainColor, { r: 80, g: 175, b: 255 });
  let rainStroke = `rgba(${rainColorRgb.r}, ${rainColorRgb.g}, ${rainColorRgb.b}, 0.52)`;

  const rain: RainParticle[] = [];
  const rainPool: RainParticle[] = [];
  const drops: DropParticle[] = [];
  const dropPool: DropParticle[] = [];
  const dropSpriteCache = new Map<string, HTMLCanvasElement>();

  let pointerActive = false;
  let pointerX = 0.5;
  let pointerY = 0.8;

  const updateSize = () => {
    width = Math.max(1, canvas.clientWidth || Math.round(canvas.width / Math.max(1, window.devicePixelRatio || 1)));
    height = Math.max(1, canvas.clientHeight || Math.round(canvas.height / Math.max(1, window.devicePixelRatio || 1)));
    dpr = clamp(canvas.width / Math.max(1, width), 1, 4);
  };

  const clearParticles = () => {
    while (rain.length > 0) {
      rainPool.push(rain.pop() as RainParticle);
    }
    while (drops.length > 0) {
      dropPool.push(drops.pop() as DropParticle);
    }
  };

  const rebuild = () => {
    updateSize();
    sizeSignature = `${Math.round(width)}x${Math.round(height)}@${dpr.toFixed(2)}`;
    clearParticles();
    spawnAccumulator = 0;
  };

  const getDropSprite = (radius: number): HTMLCanvasElement => {
    const key = `${radius.toFixed(2)}_${dpr.toFixed(2)}_${rainColorRgb.r}_${rainColorRgb.g}_${rainColorRgb.b}`;
    const cached = dropSpriteCache.get(key);
    if (cached) {
      return cached;
    }

    const diameter = radius * 2;
    const sprite = document.createElement('canvas');
    sprite.width = Math.max(1, Math.ceil(diameter * dpr));
    sprite.height = Math.max(1, Math.ceil(diameter * dpr));
    const sctx = sprite.getContext('2d');
    if (sctx) {
      sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const gradient = sctx.createRadialGradient(radius, radius, 0.8, radius, radius, radius);
      gradient.addColorStop(0, `rgba(${rainColorRgb.r}, ${rainColorRgb.g}, ${rainColorRgb.b}, 0.9)`);
      gradient.addColorStop(0.45, `rgba(${rainColorRgb.r}, ${rainColorRgb.g}, ${rainColorRgb.b}, 0.4)`);
      gradient.addColorStop(1, `rgba(${rainColorRgb.r}, ${rainColorRgb.g}, ${rainColorRgb.b}, 0)`);
      sctx.fillStyle = gradient;
      sctx.fillRect(0, 0, diameter, diameter);
    }

    dropSpriteCache.set(key, sprite);
    return sprite;
  };

  const spawnRain = (count: number, wind: number) => {
    const fallSpeed = clamp(config.fallSpeed, 280, 2600);
    const expand = Math.abs((height / Math.max(200, fallSpeed)) * wind) + 24;
    const maxRain = clamp(Math.round(config.maxRain), 80, 4000);

    for (let i = 0; i < count; i += 1) {
      if (rain.length >= maxRain) return;
      const item = rainPool.pop() || { x: 0, y: 0, z: 1, speedFactor: 1, splashed: false };
      item.x = randomBetween(-expand, width + expand);
      item.y = randomBetween(-110, -6);
      item.z = randomBetween(0.5, 1);
      item.speedFactor = randomBetween(0.82, 1.2);
      item.splashed = false;
      rain.push(item);
    }
  };

  const spawnSplash = (x: number) => {
    const maxDrops = clamp(Math.round(config.maxDrops), 80, 2600);
    const splashCount = clamp(Math.round(config.splashCount), 0, 30);
    const sizeMin = clamp(Math.round(config.dropSizeMin), 1, 4);
    const sizeMax = clamp(Math.round(config.dropSizeMax), sizeMin, 7);
    const dropMaxSpeed = clamp(config.dropMaxSpeed, 80, 900);

    for (let i = 0; i < splashCount; i += 1) {
      if (drops.length >= maxDrops) return;
      const drop = dropPool.pop() || { x: 0, y: 0, radius: sizeMin, speedX: 0, speedY: 0 };
      const radius = randomBetween(sizeMin, sizeMax + 0.01);
      const angle = randomBetween(-Math.PI * 0.5, Math.PI * 0.5);
      const speed = randomBetween(dropMaxSpeed * 0.16, dropMaxSpeed * 0.52);
      drop.x = x;
      drop.y = height - 1;
      drop.radius = radius;
      drop.speedX = Math.sin(angle) * speed;
      drop.speedY = -Math.cos(angle) * speed;
      drops.push(drop);
    }
  };

  const onPointerMove = (clientX: number, clientY: number) => {
    const rect = canvas.getBoundingClientRect();
    const nx = (clientX - rect.left) / Math.max(1, rect.width);
    const ny = (clientY - rect.top) / Math.max(1, rect.height);
    pointerX = clamp(nx, 0, 1);
    pointerY = clamp(ny, 0, 1);
    pointerActive = true;
  };

  const handleMouseMove = (event: MouseEvent) => {
    onPointerMove(event.clientX, event.clientY);
  };
  const handleMouseLeave = () => {
    pointerActive = false;
  };
  const handleTouchMove = (event: TouchEvent) => {
    const touch = event.touches[0];
    if (!touch) return;
    onPointerMove(touch.clientX, touch.clientY);
  };
  const handleTouchEnd = () => {
    pointerActive = false;
  };

  canvas.addEventListener('mousemove', handleMouseMove, { passive: true });
  canvas.addEventListener('mouseleave', handleMouseLeave);
  canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
  canvas.addEventListener('touchend', handleTouchEnd);
  canvas.addEventListener('touchcancel', handleTouchEnd);

  rebuild();

  const draw = (wind: number) => {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, width, height);

    const lineWidth = clamp(config.lineWidth, 0.2, 4);
    const lineLength = clamp(config.lineLength, 6, 90);
    const windLean = wind * 0.04;

    ctx.beginPath();
    for (let i = 0; i < rain.length; i += 1) {
      const r = rain[i];
      ctx.moveTo(r.x, r.y);
      ctx.lineTo(r.x - windLean * r.z, r.y - lineLength * r.z);
    }
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = rainStroke;
    ctx.stroke();

    for (let i = 0; i < drops.length; i += 1) {
      const d = drops[i];
      const diameter = d.radius * 2;
      const sprite = getDropSprite(d.radius);
      ctx.drawImage(sprite, d.x - d.radius, d.y - d.radius, diameter, diameter);
    }
  };

  const animate = (now: number) => {
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;

    updateSize();
    const nextSignature = `${Math.round(width)}x${Math.round(height)}@${dpr.toFixed(2)}`;
    if (nextSignature !== sizeSignature) {
      dropSpriteCache.clear();
      rebuild();
    }
    if (width <= 1 || height <= 1) {
      animationId = requestAnimationFrame(animate);
      return;
    }

    const pointerWind = config.interaction && pointerActive ? (pointerX - 0.5) * clamp(config.pointerWind, 0, 1200) : 0;
    const activeWind = clamp(config.wind, -1200, 1200) + pointerWind;
    const pointerBoost =
      config.interaction && pointerActive
        ? 1 + Math.pow(1 - pointerY, 3) * clamp(config.pointerSpawnBoost, 0, 5)
        : 1;
    const spawnRate = clamp(config.spawnRate, 20, 2500) * pointerBoost;

    spawnAccumulator += spawnRate * dt;
    if (spawnAccumulator >= 1) {
      const spawnCount = Math.min(40, Math.floor(spawnAccumulator));
      spawnAccumulator -= spawnCount;
      spawnRain(spawnCount, activeWind);
    }

    const fallSpeed = clamp(config.fallSpeed, 280, 2600);
    const gravity = clamp(config.gravity, 120, 2600);
    const dropMaxSpeed = clamp(config.dropMaxSpeed, 80, 900);

    for (let i = rain.length - 1; i >= 0; i -= 1) {
      const r = rain[i];
      r.y += fallSpeed * r.speedFactor * r.z * dt;
      r.x += activeWind * r.z * dt;

      if (r.y >= height && !r.splashed) {
        r.splashed = true;
        if (config.splashCount > 0) {
          spawnSplash(r.x);
        }
      }

      if (r.y > height + 120 || r.x < -140 || r.x > width + 140) {
        rainPool.push(r);
        rain.splice(i, 1);
      }
    }

    for (let i = drops.length - 1; i >= 0; i -= 1) {
      const d = drops[i];
      d.x += d.speedX * dt;
      d.y += d.speedY * dt;
      d.speedY += gravity * dt;
      d.speedX += activeWind * 0.08 * dt;
      d.speedX = clamp(d.speedX, -dropMaxSpeed, dropMaxSpeed);

      if (d.y > height + d.radius + 6 || d.x < -120 || d.x > width + 120) {
        dropPool.push(d);
        drops.splice(i, 1);
      }
    }

    draw(activeWind);
    animationId = requestAnimationFrame(animate);
  };

  animationId = requestAnimationFrame(animate);

  return {
    cleanup: () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('touchcancel', handleTouchEnd);
    },
    updateConfig: (newConfig) => {
      const prev = config;
      config = { ...newConfig };

      const colorChanged = prev.rainColor !== config.rainColor;
      if (colorChanged) {
        rainColorRgb = hexToRgb(config.rainColor, { r: 80, g: 175, b: 255 });
        rainStroke = `rgba(${rainColorRgb.r}, ${rainColorRgb.g}, ${rainColorRgb.b}, 0.52)`;
        dropSpriteCache.clear();
      }

      const shapeChanged =
        prev.dropSizeMin !== config.dropSizeMin ||
        prev.dropSizeMax !== config.dropSizeMax ||
        prev.maxDrops !== config.maxDrops;

      if (shapeChanged) {
        dropSpriteCache.clear();
      }
    },
  };
};
