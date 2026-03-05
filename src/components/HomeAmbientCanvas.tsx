import { useEffect, useRef } from 'react';

type ThemeMode = 'light' | 'dark';

interface HomeAmbientCanvasProps {
  theme: ThemeMode;
}

interface Orb {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  color: string;
}

const ORB_COUNT = 6;
const PARALLAX_FACTOR = 18;

const palettes: Record<ThemeMode, string[]> = {
  light: ['#68a4ff', '#78d6c4', '#ffb29f', '#9f8dff'],
  dark: ['#2f6fff', '#2fb4d7', '#5f7cff', '#2ec8a3'],
};

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function createOrbs(width: number, height: number, theme: ThemeMode): Orb[] {
  const baseRadius = Math.max(width, height) * 0.16;
  const colors = palettes[theme];
  return Array.from({ length: ORB_COUNT }, (_, index) => ({
    x: randomBetween(0, width),
    y: randomBetween(0, height),
    vx: randomBetween(-0.08, 0.08),
    vy: randomBetween(-0.06, 0.06),
    radius: baseRadius * randomBetween(0.7, 1.28),
    alpha: theme === 'dark' ? randomBetween(0.08, 0.16) : randomBetween(0.11, 0.2),
    color: colors[index % colors.length],
  }));
}

export default function HomeAmbientCanvas({ theme }: HomeAmbientCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;
    let rafId = 0;
    let orbs: Orb[] = [];

    const onPointerMove = (event: PointerEvent) => {
      if (!width || !height) {
        return;
      }
      mouseRef.current.x = event.clientX / width;
      mouseRef.current.y = event.clientY / height;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      orbs = createOrbs(width, height, theme);
    };

    const drawOrb = (orb: Orb, parallaxX: number, parallaxY: number) => {
      const dx = (orb.x - width * 0.5) / (width * 0.5);
      const dy = (orb.y - height * 0.5) / (height * 0.5);
      const px = orb.x + parallaxX * (1 + Math.abs(dx));
      const py = orb.y + parallaxY * (1 + Math.abs(dy));

      const gradient = ctx.createRadialGradient(px, py, 0, px, py, orb.radius);
      gradient.addColorStop(0, `${orb.color}${Math.round(orb.alpha * 255).toString(16).padStart(2, '0')}`);
      gradient.addColorStop(1, `${orb.color}00`);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(px, py, orb.radius, 0, Math.PI * 2);
      ctx.fill();
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      const parallaxX = (mouseRef.current.x - 0.5) * PARALLAX_FACTOR;
      const parallaxY = (mouseRef.current.y - 0.5) * PARALLAX_FACTOR;

      for (const orb of orbs) {
        orb.x += orb.vx;
        orb.y += orb.vy;

        if (orb.x < -orb.radius) {
          orb.x = width + orb.radius;
        } else if (orb.x > width + orb.radius) {
          orb.x = -orb.radius;
        }

        if (orb.y < -orb.radius) {
          orb.y = height + orb.radius;
        } else if (orb.y > height + orb.radius) {
          orb.y = -orb.radius;
        }

        drawOrb(orb, parallaxX, parallaxY);
      }

      rafId = window.requestAnimationFrame(animate);
    };

    resize();
    animate();

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.cancelAnimationFrame(rafId);
    };
  }, [theme]);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full pointer-events-none" />;
}
