import type { CanvasRenderFunction } from '../../types';
import type { ClassicFireworksConfig } from './types';

interface Point {
  x: number;
  y: number;
}

interface Firework {
  x: number;
  y: number;
  sx: number;
  sy: number;
  tx: number;
  ty: number;
  distanceToTarget: number;
  distanceTraveled: number;
  trail: Point[];
  angle: number;
  speed: number;
  brightness: number;
  targetRadius: number;
}

interface Particle {
  x: number;
  y: number;
  trail: Point[];
  angle: number;
  speed: number;
  hue: number;
  brightness: number;
  alpha: number;
  decay: number;
}

interface Rgb {
  r: number;
  g: number;
  b: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

const distance = (x1: number, y1: number, x2: number, y2: number) => {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return Math.sqrt(dx * dx + dy * dy);
};

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
    return { r: 0, g: 0, b: 0 };
  }

  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
};

const makeTrail = (length: number, x: number, y: number): Point[] => {
  const count = clamp(Math.round(length), 1, 24);
  return Array.from({ length: count }, () => ({ x, y }));
};

const resizeTrail = (trail: Point[], length: number, x: number, y: number) => {
  const count = clamp(Math.round(length), 1, 24);
  while (trail.length < count) {
    trail.push({ x, y });
  }
  if (trail.length > count) {
    trail.length = count;
  }
};

export const render: CanvasRenderFunction<ClassicFireworksConfig> = (canvas, ctx, initialConfig) => {
  let config = { ...initialConfig };
  let animationId = 0;
  let lastTime = performance.now();
  let width = 0;
  let height = 0;
  let sizeSignature = '';
  let bg = hexToRgb(config.backgroundColor);

  const fireworks: Firework[] = [];
  const particles: Particle[] = [];

  let hue = 120;
  let autoElapsed = 0;
  let holdElapsed = 0;
  let pointerDown = false;
  let mx = 0;
  let my = 0;

  const updateSize = () => {
    const dpr = window.devicePixelRatio || 1;
    width = canvas.width / dpr;
    height = canvas.height / dpr;
  };

  const launchFirework = (tx: number, ty: number) => {
    const sx = width * 0.5;
    const sy = height;
    fireworks.push({
      x: sx,
      y: sy,
      sx,
      sy,
      tx,
      ty,
      distanceToTarget: distance(sx, sy, tx, ty),
      distanceTraveled: 0,
      trail: makeTrail(config.rocketTrailLength, sx, sy),
      angle: Math.atan2(ty - sy, tx - sx),
      speed: clamp(config.rocketStartSpeed, 0.5, 8),
      brightness: randomBetween(50, 70),
      targetRadius: 1,
    });
  };

  const createExplosion = (x: number, y: number) => {
    const count = clamp(Math.round(config.particleCount), 10, 180);
    const speedMin = clamp(config.particleSpeedMin, 0.2, 10);
    const speedMax = clamp(config.particleSpeedMax, speedMin + 0.1, 24);
    const decayMin = clamp(config.particleDecayMin, 0.002, 0.08);
    const decayMax = clamp(config.particleDecayMax, decayMin + 0.001, 0.12);

    for (let i = 0; i < count; i += 1) {
      particles.push({
        x,
        y,
        trail: makeTrail(config.particleTrailLength, x, y),
        angle: randomBetween(0, Math.PI * 2),
        speed: randomBetween(speedMin, speedMax),
        hue: randomBetween(hue - 20, hue + 20),
        brightness: randomBetween(50, 80),
        alpha: 1,
        decay: randomBetween(decayMin, decayMax),
      });
    }
  };

  const onMouseMove = (event: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    mx = event.clientX - rect.left;
    my = event.clientY - rect.top;
  };
  const onMouseDown = (event: MouseEvent) => {
    event.preventDefault();
    pointerDown = true;
    if (width > 1 && height > 1) {
      launchFirework(mx || width * 0.5, my || height * 0.35);
    }
  };
  const onMouseUp = (event: MouseEvent) => {
    event.preventDefault();
    pointerDown = false;
  };
  const onMouseLeave = () => {
    pointerDown = false;
  };
  const onTouchStart = (event: TouchEvent) => {
    const touch = event.touches[0];
    if (!touch) return;
    const rect = canvas.getBoundingClientRect();
    mx = touch.clientX - rect.left;
    my = touch.clientY - rect.top;
    pointerDown = true;
    if (width > 1 && height > 1) {
      launchFirework(mx, my);
    }
  };
  const onTouchMove = (event: TouchEvent) => {
    const touch = event.touches[0];
    if (!touch) return;
    const rect = canvas.getBoundingClientRect();
    mx = touch.clientX - rect.left;
    my = touch.clientY - rect.top;
  };
  const onTouchEnd = () => {
    pointerDown = false;
  };

  canvas.addEventListener('mousemove', onMouseMove, { passive: true });
  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mouseup', onMouseUp);
  canvas.addEventListener('mouseleave', onMouseLeave);
  canvas.addEventListener('touchstart', onTouchStart, { passive: true });
  canvas.addEventListener('touchmove', onTouchMove, { passive: true });
  canvas.addEventListener('touchend', onTouchEnd);

  updateSize();
  sizeSignature = `${Math.round(width)}x${Math.round(height)}`;
  mx = width * 0.5;
  my = height * 0.35;

  const draw = (now: number) => {
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    const frameScale = dt * 60;
    lastTime = now;

    updateSize();
    const nextSignature = `${Math.round(width)}x${Math.round(height)}`;
    if (nextSignature !== sizeSignature) {
      sizeSignature = nextSignature;
      mx = width * 0.5;
      my = height * 0.35;
    }
    if (width <= 1 || height <= 1) {
      animationId = requestAnimationFrame(draw);
      return;
    }

    hue = (hue + clamp(config.hueShiftSpeed, 0, 120) * dt) % 360;

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = `rgba(${bg.r}, ${bg.g}, ${bg.b}, ${clamp(config.trailFade, 0.05, 0.9)})`;
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';

    for (let i = fireworks.length - 1; i >= 0; i -= 1) {
      const fw = fireworks[i];

      fw.trail.pop();
      fw.trail.unshift({ x: fw.x, y: fw.y });

      fw.targetRadius += 0.3 * frameScale;
      if (fw.targetRadius > 8) {
        fw.targetRadius = 1;
      }

      fw.speed *= Math.pow(clamp(config.rocketAcceleration, 1, 1.2), frameScale);

      const vx = Math.cos(fw.angle) * fw.speed;
      const vy = Math.sin(fw.angle) * fw.speed;
      const nextX = fw.x + vx * frameScale;
      const nextY = fw.y + vy * frameScale;
      fw.distanceTraveled = distance(fw.sx, fw.sy, nextX, nextY);

      if (fw.distanceTraveled >= fw.distanceToTarget) {
        createExplosion(fw.tx, fw.ty);
        fireworks.splice(i, 1);
      } else {
        fw.x = nextX;
        fw.y = nextY;
      }

      ctx.beginPath();
      const tail = fw.trail[fw.trail.length - 1];
      ctx.moveTo(tail.x, tail.y);
      ctx.lineTo(fw.x, fw.y);
      ctx.strokeStyle = `hsl(${hue}, 100%, ${fw.brightness}%)`;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(fw.tx, fw.ty, fw.targetRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `hsl(${hue}, 100%, ${fw.brightness}%)`;
      ctx.stroke();
    }

    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const p = particles[i];

      p.trail.pop();
      p.trail.unshift({ x: p.x, y: p.y });

      p.speed *= Math.pow(clamp(config.particleFriction, 0.8, 0.999), frameScale);
      p.x += Math.cos(p.angle) * p.speed * frameScale;
      p.y += Math.sin(p.angle) * p.speed * frameScale + clamp(config.particleGravity, -0.5, 3) * frameScale;
      p.alpha -= p.decay * frameScale;

      if (p.alpha <= p.decay) {
        particles.splice(i, 1);
        continue;
      }

      const tail = p.trail[p.trail.length - 1];
      ctx.beginPath();
      ctx.moveTo(tail.x, tail.y);
      ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = `hsla(${p.hue}, 100%, ${p.brightness}%, ${p.alpha})`;
      ctx.stroke();
    }

    const autoInterval = clamp(config.autoLaunchInterval, 120, 3000);
    if (!pointerDown) {
      autoElapsed += dt * 1000;
      if (autoElapsed >= autoInterval) {
        autoElapsed %= autoInterval;
        launchFirework(randomBetween(0, width), randomBetween(0, height * 0.5));
      }
      holdElapsed = 0;
    } else {
      holdElapsed += dt * 1000;
      const holdInterval = clamp(config.holdLaunchInterval, 30, 600);
      if (holdElapsed >= holdInterval) {
        holdElapsed %= holdInterval;
        launchFirework(mx, my);
      }
    }

    animationId = requestAnimationFrame(draw);
  };

  animationId = requestAnimationFrame(draw);

  return {
    cleanup: () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('mouseleave', onMouseLeave);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
    },
    updateConfig: (newConfig) => {
      const prev = config;
      config = { ...newConfig };

      if (prev.backgroundColor !== config.backgroundColor) {
        bg = hexToRgb(config.backgroundColor);
      }

      if (prev.rocketTrailLength !== config.rocketTrailLength) {
        for (const fw of fireworks) {
          resizeTrail(fw.trail, config.rocketTrailLength, fw.x, fw.y);
        }
      }

      if (prev.particleTrailLength !== config.particleTrailLength) {
        for (const p of particles) {
          resizeTrail(p.trail, config.particleTrailLength, p.x, p.y);
        }
      }
    },
  };
};
