import type { BackgroundDefinition, Config } from '../../types/canvas';

interface ParticleConfig extends Config {
  count: number;
  color: string;
  speed: number;
  size: number;
  opacity: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

const defaultConfig: ParticleConfig = {
  count: 80,
  color: '#00d4ff',
  speed: 1.5,
  size: 3,
  opacity: 0.7,
};

const generateCode = (config: ParticleConfig): string => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Particle Animation</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0a0a0f; overflow: hidden; }
  canvas { display: block; }
</style>
</head>
<body>
<canvas id="canvas"></canvas>
<script>
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const COUNT = ${config.count};
const COLOR = '${config.color}';
const SPEED = ${config.speed};
const SIZE = ${config.size};
const OPACITY = ${config.opacity};

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return r + ',' + g + ',' + b;
}

const rgb = hexToRgb(COLOR);

const particles = Array.from({ length: COUNT }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  vx: (Math.random() - 0.5) * SPEED * 2,
  vy: (Math.random() - 0.5) * SPEED * 2,
  radius: Math.random() * SIZE + 1,
}));

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(' + rgb + ',' + OPACITY + ')';
    ctx.fill();
  }
  requestAnimationFrame(animate);
}
animate();
</script>
</body>
</html>`;

const render = (canvas: HTMLCanvasElement, config: ParticleConfig): (() => void) => {
  const ctx = canvas.getContext('2d')!;
  let animId: number;

  const resize = () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  };
  resize();
  window.addEventListener('resize', resize);

  const hexToRgb = (hex: string): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r},${g},${b}`;
  };

  const rgb = hexToRgb(config.color);

  const particles: Particle[] = Array.from({ length: config.count }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * config.speed * 2,
    vy: (Math.random() - 0.5) * config.speed * 2,
    radius: Math.random() * config.size + 1,
  }));

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgb},${config.opacity})`;
      ctx.fill();
    }
    animId = requestAnimationFrame(animate);
  };
  animate();

  return () => {
    cancelAnimationFrame(animId);
    window.removeEventListener('resize', resize);
  };
};

export const particlesBackground: BackgroundDefinition<ParticleConfig> = {
  id: 'particles',
  name: 'Particle Field',
  description: 'Floating particles that drift and bounce around the canvas.',
  tags: ['particles', 'animated', 'minimal'],
  defaultConfig,
  configSchema: {
    count: { type: 'range', label: 'Particle Count', min: 10, max: 300, step: 10 },
    color: { type: 'color', label: 'Color' },
    speed: { type: 'range', label: 'Speed', min: 0.1, max: 5, step: 0.1 },
    size: { type: 'range', label: 'Size', min: 1, max: 15, step: 0.5 },
    opacity: { type: 'range', label: 'Opacity', min: 0.1, max: 1, step: 0.05 },
  },
  generateCode,
  render,
};
