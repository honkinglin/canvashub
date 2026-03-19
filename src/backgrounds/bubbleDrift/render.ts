import type { CanvasRenderFunction } from '../../types';
import type { BubbleDriftConfig } from './types';

interface Bubble {
  x: number;
  y: number;
  radius: number;
  speed: number;
  opacity: number;
  driftPhase: number;
  driftSpeed: number;
}

interface Rgb {
  r: number;
  g: number;
  b: number;
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

export const render: CanvasRenderFunction<BubbleDriftConfig> = (canvas, ctx, initialConfig) => {
  let config = { ...initialConfig };
  let animationId = 0;
  let width = 0;
  let height = 0;
  let sizeSignature = '';
  let lastTime = performance.now();

  let coreRgb = hexToRgb(config.colorCore, { r: 255, g: 255, b: 255 });
  let midRgb = hexToRgb(config.colorMid, { r: 173, g: 216, b: 230 });
  let edgeRgb = hexToRgb(config.colorEdge, { r: 0, g: 100, b: 160 });

  const bubbles: Bubble[] = [];
  const spriteCache = new Map<string, HTMLCanvasElement>();

  const mouse = {
    x: 0,
    y: 0,
    active: false,
  };

  const updateSize = () => {
    const dpr = window.devicePixelRatio || 1;
    width = canvas.width / dpr;
    height = canvas.height / dpr;
  };

  const spriteKey = (radius: number, opacity: number) =>
    `${Math.round(radius * 4)}_${Math.round(opacity * 100)}_${config.colorCore}_${config.colorMid}_${config.colorEdge}_${config.outlineAlpha}`;

  const getSprite = (radius: number, opacity: number) => {
    const key = spriteKey(radius, opacity);
    const cached = spriteCache.get(key);
    if (cached) return cached;

    const pad = 2;
    const size = Math.ceil(radius * 2 + pad * 2);
    const off = document.createElement('canvas');
    off.width = size;
    off.height = size;
    const octx = off.getContext('2d');
    if (!octx) return off;

    const cx = size * 0.5;
    const cy = size * 0.5;
    const g = octx.createRadialGradient(
      cx - radius / 3,
      cy - radius / 3,
      radius * 0.1,
      cx,
      cy,
      radius
    );
    g.addColorStop(0, `rgba(${coreRgb.r}, ${coreRgb.g}, ${coreRgb.b}, ${opacity})`);
    g.addColorStop(0.5, `rgba(${midRgb.r}, ${midRgb.g}, ${midRgb.b}, ${opacity})`);
    g.addColorStop(1, `rgba(${edgeRgb.r}, ${edgeRgb.g}, ${edgeRgb.b}, ${opacity * 0.5})`);

    octx.beginPath();
    octx.arc(cx, cy, radius, 0, Math.PI * 2);
    octx.fillStyle = g;
    octx.fill();

    const oa = clamp(config.outlineAlpha, 0, 1) * opacity;
    if (oa > 0) {
      octx.strokeStyle = `rgba(${coreRgb.r}, ${coreRgb.g}, ${coreRgb.b}, ${oa})`;
      octx.lineWidth = 0.5;
      octx.stroke();
    }

    spriteCache.set(key, off);
    return off;
  };

  const resetBubble = (bubble: Bubble, spawnAtBottom: boolean) => {
    const radiusMin = clamp(config.radiusMin, 1, 200);
    const radiusMax = clamp(config.radiusMax, radiusMin + 1, 240);
    const speedMin = clamp(config.speedMin, 0.01, 20);
    const speedMax = clamp(config.speedMax, speedMin + 0.01, 25);
    const opacityMin = clamp(config.opacityMin, 0.01, 1);
    const opacityMax = clamp(config.opacityMax, opacityMin, 1);

    bubble.radius = randomBetween(radiusMin, radiusMax);
    bubble.speed = randomBetween(speedMin, speedMax);
    bubble.opacity = randomBetween(opacityMin, opacityMax);
    bubble.x = randomBetween(0, width);
    bubble.y = spawnAtBottom ? height + randomBetween(0, height) : randomBetween(0, height);
    bubble.driftPhase = randomBetween(0, Math.PI * 2);
    bubble.driftSpeed = randomBetween(0.4, 1.5);
  };

  const syncCount = (resetAll: boolean) => {
    const target = clamp(Math.round(config.bubbleCount), 1, 800);
    while (bubbles.length < target) {
      const b: Bubble = {
        x: 0,
        y: 0,
        radius: 12,
        speed: 1,
        opacity: 0.4,
        driftPhase: 0,
        driftSpeed: 1,
      };
      resetBubble(b, true);
      bubbles.push(b);
    }
    if (bubbles.length > target) {
      bubbles.length = target;
    }
    if (resetAll) {
      for (let i = 0; i < bubbles.length; i += 1) {
        resetBubble(bubbles[i], false);
      }
    }
  };

  const onPointer = (clientX: number, clientY: number) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = clientX - rect.left;
    mouse.y = clientY - rect.top;
    mouse.active = true;
  };

  const onMouseMove = (event: MouseEvent) => onPointer(event.clientX, event.clientY);
  const onMouseLeave = () => {
    mouse.active = false;
  };
  const onTouchMove = (event: TouchEvent) => {
    const touch = event.touches[0];
    if (!touch) return;
    onPointer(touch.clientX, touch.clientY);
  };
  const onTouchEnd = () => {
    mouse.active = false;
  };

  canvas.addEventListener('mousemove', onMouseMove, { passive: true });
  canvas.addEventListener('mouseleave', onMouseLeave);
  canvas.addEventListener('touchmove', onTouchMove, { passive: true });
  canvas.addEventListener('touchend', onTouchEnd);
  canvas.addEventListener('touchcancel', onTouchEnd);

  const rebuild = () => {
    updateSize();
    sizeSignature = `${Math.round(width)}x${Math.round(height)}:${Math.round(config.bubbleCount)}`;
    if (width <= 1 || height <= 1) return;
    syncCount(true);
  };

  rebuild();

  const draw = (now: number) => {
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    const frameScale = dt * 60;
    lastTime = now;

    updateSize();
    const nextSignature = `${Math.round(width)}x${Math.round(height)}:${Math.round(config.bubbleCount)}`;
    if (nextSignature !== sizeSignature) {
      rebuild();
    }
    if (width <= 1 || height <= 1) {
      animationId = requestAnimationFrame(draw);
      return;
    }

    syncCount(false);

    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, width, height);

    const repelRadius = clamp(config.repelRadius, 1, 1200);
    const repelStrength = clamp(config.repelStrength, 0, 80);
    const drift = clamp(config.drift, 0, 20);

    for (let i = 0; i < bubbles.length; i += 1) {
      const b = bubbles[i];
      b.y -= b.speed * frameScale;
      b.x += Math.sin(now * 0.001 * b.driftSpeed + b.driftPhase) * drift * 0.03 * frameScale;

      if (mouse.active) {
        const dx = b.x - mouse.x;
        const dy = b.y - mouse.y;
        const range = repelRadius + b.radius;
        const distSq = dx * dx + dy * dy;
        if (distSq < range * range) {
          const dist = Math.sqrt(distSq) || 0.0001;
          const force = (range - dist) / Math.max(1, repelRadius);
          const push = force * repelStrength * frameScale;
          b.x += (dx / dist) * push;
          b.y += (dy / dist) * push;
        }
      }

      if (b.y + b.radius < 0 || b.x < -b.radius * 3 || b.x > width + b.radius * 3) {
        resetBubble(b, true);
      }

      const sprite = getSprite(b.radius, b.opacity);
      const half = sprite.width * 0.5;
      ctx.drawImage(sprite, b.x - half, b.y - half);
    }

    animationId = requestAnimationFrame(draw);
  };

  animationId = requestAnimationFrame(draw);

  return {
    cleanup: () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseleave', onMouseLeave);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('touchcancel', onTouchEnd);
    },
    updateConfig: (newConfig) => {
      const prev = config;
      config = { ...newConfig };

      const colorsChanged =
        prev.colorCore !== config.colorCore ||
        prev.colorMid !== config.colorMid ||
        prev.colorEdge !== config.colorEdge ||
        prev.outlineAlpha !== config.outlineAlpha;
      if (colorsChanged) {
        coreRgb = hexToRgb(config.colorCore, { r: 255, g: 255, b: 255 });
        midRgb = hexToRgb(config.colorMid, { r: 173, g: 216, b: 230 });
        edgeRgb = hexToRgb(config.colorEdge, { r: 0, g: 100, b: 160 });
        spriteCache.clear();
      }
    },
  };
};
