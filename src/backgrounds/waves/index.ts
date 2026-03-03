import type { BackgroundDefinition, Config } from '../../types/canvas';

interface WaveConfig extends Config {
  waveCount: number;
  amplitude: number;
  frequency: number;
  speed: number;
  color: string;
  lineWidth: number;
}

const defaultConfig: WaveConfig = {
  waveCount: 3,
  amplitude: 50,
  frequency: 0.02,
  speed: 0.05,
  color: '#6366f1',
  lineWidth: 2,
};

const generateCode = (config: WaveConfig): string => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Wave Animation</title>
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
const WAVE_COUNT = ${config.waveCount};
const AMPLITUDE = ${config.amplitude};
const FREQUENCY = ${config.frequency};
const SPEED = ${config.speed};
const COLOR = '${config.color}';
const LINE_WIDTH = ${config.lineWidth};

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
let time = 0;

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let w = 0; w < WAVE_COUNT; w++) {
    const offset = (w / WAVE_COUNT) * Math.PI * 2;
    const alpha = 0.3 + (w / WAVE_COUNT) * 0.5;
    ctx.beginPath();
    for (let x = 0; x <= canvas.width; x += 2) {
      const y = canvas.height / 2 + Math.sin(x * FREQUENCY + time + offset) * AMPLITUDE;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = 'rgba(' + rgb + ',' + alpha + ')';
    ctx.lineWidth = LINE_WIDTH;
    ctx.stroke();
  }
  time += SPEED;
  requestAnimationFrame(animate);
}
animate();
</script>
</body>
</html>`;

const render = (canvas: HTMLCanvasElement, config: WaveConfig): (() => void) => {
  const ctx = canvas.getContext('2d')!;
  let animId: number;
  let time = 0;

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

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let w = 0; w < config.waveCount; w++) {
      const offset = (w / config.waveCount) * Math.PI * 2;
      const alpha = 0.3 + (w / config.waveCount) * 0.5;
      ctx.beginPath();
      for (let x = 0; x <= canvas.width; x += 2) {
        const y = canvas.height / 2 + Math.sin(x * config.frequency + time + offset) * config.amplitude;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(${rgb},${alpha})`;
      ctx.lineWidth = config.lineWidth;
      ctx.stroke();
    }
    time += config.speed;
    animId = requestAnimationFrame(animate);
  };
  animate();

  return () => {
    cancelAnimationFrame(animId);
    window.removeEventListener('resize', resize);
  };
};

export const wavesBackground: BackgroundDefinition<WaveConfig> = {
  id: 'waves',
  name: 'Animated Waves',
  description: 'Smooth sine waves flowing across the canvas.',
  tags: ['waves', 'animated', 'fluid'],
  defaultConfig,
  configSchema: {
    waveCount: { type: 'range', label: 'Wave Count', min: 1, max: 10, step: 1 },
    amplitude: { type: 'range', label: 'Amplitude', min: 10, max: 200, step: 5 },
    frequency: { type: 'range', label: 'Frequency', min: 0.001, max: 0.05, step: 0.001 },
    speed: { type: 'range', label: 'Speed', min: 0.01, max: 0.1, step: 0.005 },
    color: { type: 'color', label: 'Color' },
    lineWidth: { type: 'range', label: 'Line Width', min: 1, max: 10, step: 0.5 },
  },
  generateCode,
  render,
};
