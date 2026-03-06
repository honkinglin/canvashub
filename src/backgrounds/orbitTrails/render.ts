import type { CanvasRenderFunction } from '../../types';
import type { OrbitTrailsConfig } from './types';

interface Particle {
  size: number;
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
  shiftX: number;
  shiftY: number;
  speed: number;
  targetSize: number;
  hue: number;
  hueShift: number;
  orbit: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

const normalizeHue = (hue: number) => {
  const wrapped = hue % 360;
  return wrapped < 0 ? wrapped + 360 : wrapped;
};

const hsla = (h: number, s: number, l: number, a: number) =>
  `hsla(${normalizeHue(h)}, ${s}%, ${l}%, ${a})`;

const createParticle = (mouseX: number, mouseY: number, config: OrbitTrailsConfig): Particle => {
  const speedMin = clamp(config.speedMin, 0.005, 0.12);
  const speedMax = clamp(config.speedMax, speedMin + 0.001, 0.2);
  const sizeMin = clamp(config.sizeMin, 0.5, 8);
  const sizeMax = clamp(config.sizeMax, sizeMin + 0.1, 16);
  const hueMin = clamp(config.hueMin, 0, 360);
  const hueMax = clamp(config.hueMax, hueMin + 1, 360);
  const radius = clamp(config.orbitRadius, 10, 220);

  return {
    size: sizeMin,
    x: mouseX,
    y: mouseY,
    offsetX: 0,
    offsetY: 0,
    shiftX: mouseX,
    shiftY: mouseY,
    speed: randomBetween(speedMin, speedMax),
    targetSize: randomBetween(sizeMin, sizeMax),
    hue: randomBetween(hueMin, hueMax),
    hueShift: randomBetween(8, 24),
    orbit: radius * 0.5 + radius * 0.5 * Math.random(),
  };
};

export const render: CanvasRenderFunction<OrbitTrailsConfig> = (canvas, ctx, initialConfig) => {
  let config = { ...initialConfig };
  let animationId = 0;
  let lastTime = performance.now();
  let width = 0;
  let height = 0;
  let sizeSignature = '';

  let particles: Particle[] = [];
  let mouseX = 0;
  let mouseY = 0;
  let pointerDown = false;
  let radiusScale = 1;

  const updateSize = () => {
    const dpr = window.devicePixelRatio || 1;
    width = canvas.width / dpr;
    height = canvas.height / dpr;
  };

  const syncParticleCount = (createFromScratch = false) => {
    const count = clamp(Math.round(config.particleCount), 8, 120);

    if (createFromScratch) {
      particles = Array.from({ length: count }, () => createParticle(mouseX, mouseY, config));
      return;
    }

    while (particles.length < count) {
      particles.push(createParticle(mouseX, mouseY, config));
    }
    if (particles.length > count) {
      particles.length = count;
    }
  };

  const rebuild = () => {
    updateSize();
    sizeSignature = `${Math.round(width)}x${Math.round(height)}`;
    mouseX = width * 0.5;
    mouseY = height * 0.5;
    syncParticleCount(true);
  };

  const updateMouse = (x: number, y: number) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = x - rect.left;
    mouseY = y - rect.top;
  };

  const onMouseMove = (event: MouseEvent) => updateMouse(event.clientX, event.clientY);
  const onMouseDown = () => {
    pointerDown = true;
  };
  const onMouseUp = () => {
    pointerDown = false;
  };
  const onTouchStart = (event: TouchEvent) => {
    const touch = event.touches[0];
    if (!touch) return;
    pointerDown = true;
    updateMouse(touch.clientX, touch.clientY);
  };
  const onTouchMove = (event: TouchEvent) => {
    const touch = event.touches[0];
    if (!touch) return;
    updateMouse(touch.clientX, touch.clientY);
  };
  const onTouchEnd = () => {
    pointerDown = false;
  };

  window.addEventListener('mousemove', onMouseMove, { passive: true });
  window.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mouseup', onMouseUp);
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: true });
  window.addEventListener('touchend', onTouchEnd);

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

    const scaleMax = clamp(config.orbitScaleMax, 1, 3);
    const boost = config.pressBoost && pointerDown;
    if (boost) {
      radiusScale += (scaleMax - radiusScale) * 0.02 * frameScale;
    } else {
      radiusScale += (1 - radiusScale) * 0.02 * frameScale;
    }
    radiusScale = clamp(radiusScale, 1, scaleMax);

    ctx.fillStyle = `rgba(0,0,0,${clamp(config.trailAlpha, 0.01, 0.3)})`;
    if (config.backgroundColor !== '#000000') {
      ctx.fillStyle = config.backgroundColor;
      ctx.globalAlpha = clamp(config.trailAlpha, 0.01, 0.3);
    }
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 1;

    const sizeMin = clamp(config.sizeMin, 0.5, 8);
    const sizeMax = clamp(config.sizeMax, sizeMin + 0.1, 16);
    const orbitRadius = clamp(config.orbitRadius, 10, 220);

    for (let i = 0; i < particles.length; i += 1) {
      const p = particles[i];
      const prevX = p.x;
      const prevY = p.y;

      p.offsetX += p.speed * frameScale;
      p.offsetY += p.speed * frameScale;

      const follow = clamp(p.speed * frameScale, 0, 1);
      p.shiftX += (mouseX - p.shiftX) * follow;
      p.shiftY += (mouseY - p.shiftY) * follow;

      p.x = p.shiftX + Math.cos(i + p.offsetX) * (p.orbit * radiusScale);
      p.y = p.shiftY + Math.sin(i + p.offsetY) * (p.orbit * radiusScale);

      p.x = clamp(p.x, 0, width);
      p.y = clamp(p.y, 0, height);

      p.size += (p.targetSize - p.size) * 0.05 * frameScale;
      if (Math.abs(p.size - p.targetSize) < 0.08) {
        p.targetSize = randomBetween(sizeMin, sizeMax);
      }

      p.orbit += (orbitRadius - p.orbit) * 0.02 * frameScale;
      p.hue += p.hueShift * 0.08 * frameScale;

      const gradient = ctx.createLinearGradient(prevX, prevY, p.x, p.y);
      gradient.addColorStop(0, hsla(p.hue - 28, 88, 60, 0.22));
      gradient.addColorStop(1, hsla(p.hue + 16, 96, 70, 0.95));

      ctx.beginPath();
      ctx.strokeStyle = gradient;
      ctx.lineWidth = p.size;
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.fillStyle = hsla(p.hue + 8, 98, 72, 0.96);
      ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    animationId = requestAnimationFrame(draw);
  };

  animationId = requestAnimationFrame(draw);

  return {
    cleanup: () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    },
    updateConfig: (newConfig) => {
      const prev = config;
      config = { ...newConfig };

      const needRecreate =
        prev.particleCount !== config.particleCount ||
        prev.hueMin !== config.hueMin ||
        prev.hueMax !== config.hueMax ||
        prev.speedMin !== config.speedMin ||
        prev.speedMax !== config.speedMax;

      if (needRecreate) {
        syncParticleCount(true);
      }
    },
  };
};
