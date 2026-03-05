import type { CanvasRenderFunction } from '../../types';
import type { CursorTrailConfig } from './types';


interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
}


const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const hexToRgb = (hex: string) => {
  const parsed = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!parsed) return { r: 255, g: 255, b: 255 };
  return {
    r: parseInt(parsed[1], 16),
    g: parseInt(parsed[2], 16),
    b: parseInt(parsed[3], 16),
  };
};

export const render: CanvasRenderFunction<CursorTrailConfig> = (canvas, ctx, initialConfig) => {
  let config = { ...initialConfig };
  let animationId = 0;
  let width = 0;
  let height = 0;
  let sizeSignature = '';

  const mouse = { x: -1e6, y: -1e6, active: false };
  let particles: Particle[] = [];

  const updateSize = () => {
    const dpr = window.devicePixelRatio || 1;
    width = canvas.width / dpr;
    height = canvas.height / dpr;
  };

  const respawnParticle = (p: Particle) => {
    p.x = Math.random() * width;
    p.y = Math.random() * height;
    p.vx = (Math.random() - 0.5) * 0.5;
    p.vy = (Math.random() - 0.5) * 0.5;
    p.alpha = Math.random() * 0.4 + 0.2;
  };

  const createParticles = () => {
    if (width <= 1 || height <= 1) {
      particles = [];
      return;
    }
    const count = Math.max(60, Math.min(5000, Math.round(config.particleCount)));
    particles = new Array(count).fill(0).map(() => {
      const p = { x: 0, y: 0, vx: 0, vy: 0, alpha: 0 };
      respawnParticle(p);
      return p;
    });
  };

  const handleMouseMove = (event: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
    mouse.active = true;
  };
  const handleTouchMove = (event: TouchEvent) => {
    const touch = event.touches[0];
    if (!touch) return;
    const rect = canvas.getBoundingClientRect();
    mouse.x = touch.clientX - rect.left;
    mouse.y = touch.clientY - rect.top;
    mouse.active = true;
  };
  const handleLeave = () => {
    mouse.active = false;
  };

  window.addEventListener('mousemove', handleMouseMove, { passive: true });
  window.addEventListener('touchmove', handleTouchMove, { passive: true });
  window.addEventListener('mouseleave', handleLeave);
  window.addEventListener('touchend', handleLeave);

  updateSize();
  sizeSignature = `${Math.round(width)}x${Math.round(height)}`;
  createParticles();

  const draw = () => {
    updateSize();
    const nextSignature = `${Math.round(width)}x${Math.round(height)}`;
    if (nextSignature !== sizeSignature) {
      sizeSignature = nextSignature;
      createParticles();
    }
    if (width <= 1 || height <= 1) {
      animationId = requestAnimationFrame(draw);
      return;
    }

    const rgb = hexToRgb(config.particleColor);
    const bg = hexToRgb(config.backgroundColor);
    ctx.fillStyle = `rgba(${bg.r}, ${bg.g}, ${bg.b}, ${clamp(config.trailAlpha, 0.01, 1)})`;
    ctx.fillRect(0, 0, width, height);

    const maxVelocity = clamp(config.maxVelocity, 0.05, 12);
    const maxVelocitySq = maxVelocity * maxVelocity;
    const mouseRadius = clamp(config.mouseRadius, 10, 1000);
    const mouseRadiusSq = mouseRadius * mouseRadius;
    const jitter = clamp(config.jitter, 0, 0.3);
    const pointSize = clamp(config.pointSize, 0.2, 4);
    const forceBase = 0.02 * clamp(config.mouseStrength, 0, 2.5);
    const respawnMargin = 10;

    for (let i = 0; i < particles.length; i += 1) {
      const p = particles[i];

      p.vx += (Math.random() - 0.5) * jitter;
      p.vy += (Math.random() - 0.5) * jitter;

      if (mouse.active) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < mouseRadiusSq) {
          const dist = Math.sqrt(distSq) || 1;
          const force = (mouseRadius - dist) / mouseRadius;
          p.vx += dx * force * forceBase;
          p.vy += dy * force * forceBase;
        }
      }

      const speedSq = p.vx * p.vx + p.vy * p.vy;
      if (speedSq > maxVelocitySq) {
        const speed = Math.sqrt(speedSq);
        const ratio = maxVelocity / speed;
        p.vx *= ratio;
        p.vy *= ratio;
      }

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -respawnMargin || p.x > width + respawnMargin || p.y < -respawnMargin || p.y > height + respawnMargin) {
        respawnParticle(p);
      }

      ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${p.alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, pointSize, 0, Math.PI * 2);
      ctx.fill();
    }

    animationId = requestAnimationFrame(draw);
  };

  draw();

  return {
    cleanup: () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseleave', handleLeave);
      window.removeEventListener('touchend', handleLeave);
    },
    updateConfig: (newConfig) => {
      const oldCount = config.particleCount;
      config = { ...newConfig };
      if (Math.round(oldCount) !== Math.round(config.particleCount) && width > 1 && height > 1) {
        createParticles();
      }
    },
  };
};
