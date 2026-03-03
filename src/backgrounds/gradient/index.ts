import type { BackgroundDefinition, Config } from '../../types/canvas';

interface GradientConfig extends Config {
  color1: string;
  color2: string;
  color3: string;
  speed: number;
  angle: number;
}

const defaultConfig: GradientConfig = {
  color1: '#667eea',
  color2: '#764ba2',
  color3: '#f093fb',
  speed: 1,
  angle: 135,
};

const generateCode = (config: GradientConfig): string => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Gradient Animation</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { overflow: hidden; }
  canvas { display: block; }
</style>
</head>
<body>
<canvas id="canvas"></canvas>
<script>
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const COLOR1 = '${config.color1}';
const COLOR2 = '${config.color2}';
const COLOR3 = '${config.color3}';
const SPEED = ${config.speed};
const ANGLE_DEG = ${config.angle};

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

function hexToRgb(hex) {
  return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)];
}

function lerp(a, b, t) { return a + (b - a) * t; }

function lerpColor(c1, c2, t) {
  return [lerp(c1[0],c2[0],t), lerp(c1[1],c2[1],t), lerp(c1[2],c2[2],t)];
}

const c1 = hexToRgb(COLOR1);
const c2 = hexToRgb(COLOR2);
const c3 = hexToRgb(COLOR3);
let time = 0;
const angleRad = ANGLE_DEG * Math.PI / 180;

function animate() {
  const t1 = (Math.sin(time) + 1) / 2;
  const t2 = (Math.sin(time + Math.PI * 0.66) + 1) / 2;

  const startColor = lerpColor(c1, c2, t1);
  const endColor = lerpColor(c2, c3, t2);

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const len = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height);
  const x0 = cx - Math.cos(angleRad) * len / 2;
  const y0 = cy - Math.sin(angleRad) * len / 2;
  const x1 = cx + Math.cos(angleRad) * len / 2;
  const y1 = cy + Math.sin(angleRad) * len / 2;

  const grad = ctx.createLinearGradient(x0, y0, x1, y1);
  grad.addColorStop(0, 'rgb(' + startColor.map(Math.round).join(',') + ')');
  grad.addColorStop(1, 'rgb(' + endColor.map(Math.round).join(',') + ')');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  time += 0.005 * SPEED;
  requestAnimationFrame(animate);
}
animate();
</script>
</body>
</html>`;

const render = (canvas: HTMLCanvasElement, config: GradientConfig): (() => void) => {
  const ctx = canvas.getContext('2d')!;
  let animId: number;
  let time = 0;

  const resize = () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  };
  resize();
  window.addEventListener('resize', resize);

  const hexToRgb = (hex: string): [number, number, number] => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const lerpColor = (c1: [number, number, number], c2: [number, number, number], t: number): [number, number, number] => [
    lerp(c1[0], c2[0], t),
    lerp(c1[1], c2[1], t),
    lerp(c1[2], c2[2], t),
  ];

  const c1 = hexToRgb(config.color1);
  const c2 = hexToRgb(config.color2);
  const c3 = hexToRgb(config.color3);
  const angleRad = (config.angle * Math.PI) / 180;

  const animate = () => {
    const t1 = (Math.sin(time) + 1) / 2;
    const t2 = (Math.sin(time + Math.PI * 0.66) + 1) / 2;

    const startColor = lerpColor(c1, c2, t1);
    const endColor = lerpColor(c2, c3, t2);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const len = Math.sqrt(canvas.width ** 2 + canvas.height ** 2);
    const x0 = cx - Math.cos(angleRad) * len / 2;
    const y0 = cy - Math.sin(angleRad) * len / 2;
    const x1 = cx + Math.cos(angleRad) * len / 2;
    const y1 = cy + Math.sin(angleRad) * len / 2;

    const grad = ctx.createLinearGradient(x0, y0, x1, y1);
    grad.addColorStop(0, `rgb(${startColor.map(Math.round).join(',')})`);
    grad.addColorStop(1, `rgb(${endColor.map(Math.round).join(',')})`);

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    time += 0.005 * config.speed;
    animId = requestAnimationFrame(animate);
  };
  animate();

  return () => {
    cancelAnimationFrame(animId);
    window.removeEventListener('resize', resize);
  };
};

export const gradientBackground: BackgroundDefinition<GradientConfig> = {
  id: 'gradient',
  name: 'Animated Gradient',
  description: 'Smoothly shifting color gradients that cycle through hues.',
  tags: ['gradient', 'colorful', 'smooth'],
  defaultConfig,
  configSchema: {
    color1: { type: 'color', label: 'Color 1' },
    color2: { type: 'color', label: 'Color 2' },
    color3: { type: 'color', label: 'Color 3' },
    speed: { type: 'range', label: 'Speed', min: 0.1, max: 5, step: 0.1 },
    angle: { type: 'range', label: 'Angle', min: 0, max: 360, step: 1 },
  },
  generateCode,
  render,
};
