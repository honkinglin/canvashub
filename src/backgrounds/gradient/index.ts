import type { BackgroundModule, CanvasRenderFunction, ConfigRecord } from '../../types';

export interface GradientConfig extends ConfigRecord {
  color1: string;
  color2: string;
  color3: string;
  speed: number;
  scale: number;
}

const defaultConfig: GradientConfig = {
  color1: '#ff4b8b',
  color2: '#6366f1',
  color3: '#0ea5e9',
  speed: 1,
  scale: 1,
};

const render: CanvasRenderFunction<GradientConfig> = (canvas, ctx, initialConfig) => {
  let config = { ...initialConfig };
  let animationId: number;
  let time = 0;

  const draw = () => {
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    // Moving radial gradients to simulate fluid/mesh gradient
    const t = time * 0.01;
    
    // Clear
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    ctx.globalCompositeOperation = 'screen';

    const drawBlob = (color: string, offsetX: number, offsetY: number, radiusRatio: number) => {
      const gradient = ctx.createRadialGradient(
        offsetX, offsetY, 0,
        offsetX, offsetY, Math.max(width, height) * radiusRatio * config.scale
      );
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    };

    // Blob 1
    const x1 = width * 0.5 + Math.sin(t) * width * 0.3;
    const y1 = height * 0.5 + Math.cos(t * 0.8) * height * 0.3;
    drawBlob(config.color1, x1, y1, 0.8);

    // Blob 2
    const x2 = width * 0.5 + Math.sin(t * 1.2 + Math.PI) * width * 0.3;
    const y2 = height * 0.5 + Math.cos(t * 0.9 + Math.PI) * height * 0.4;
    drawBlob(config.color2, x2, y2, 0.9);

    // Blob 3
    const x3 = width * 0.5 + Math.cos(t * 1.1) * width * 0.2;
    const y3 = height * 0.5 + Math.sin(t * 1.3) * height * 0.3;
    drawBlob(config.color3, x3, y3, 0.7);

    ctx.globalCompositeOperation = 'source-over';

    time += config.speed;
    animationId = requestAnimationFrame(draw);
  };

  draw();

  return {
    cleanup: () => cancelAnimationFrame(animationId),
    updateConfig: (newConfig) => {
      config = { ...newConfig };
    }
  };
};

const generateCode = (config: GradientConfig) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Fluid Gradient</title>
  <style>
    html, body { margin: 0; width: 100%; height: 100%; overflow: hidden; background: #0f172a; }
    canvas { display: block; width: 100%; height: 100%; }
  </style>
</head>
<body>
  <canvas id="canvas"></canvas>
  <script>
    const config = ${JSON.stringify(config, null, 2)};
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let time = 0;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function drawBlob(color, x, y, radius) {
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }

    function draw() {
      const t = time * 0.01;
      const maxRadius = Math.max(width, height);

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'screen';

      drawBlob(
        config.color1,
        width * 0.5 + Math.sin(t) * width * 0.3,
        height * 0.5 + Math.cos(t * 0.8) * height * 0.3,
        maxRadius * 0.8 * config.scale
      );
      drawBlob(
        config.color2,
        width * 0.5 + Math.sin(t * 1.2 + Math.PI) * width * 0.3,
        height * 0.5 + Math.cos(t * 0.9 + Math.PI) * height * 0.4,
        maxRadius * 0.9 * config.scale
      );
      drawBlob(
        config.color3,
        width * 0.5 + Math.cos(t * 1.1) * width * 0.2,
        height * 0.5 + Math.sin(t * 1.3) * height * 0.3,
        maxRadius * 0.7 * config.scale
      );

      ctx.globalCompositeOperation = 'source-over';
      time += config.speed;
      requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener('resize', resize);
  </script>
</body>
</html>
`;

export const gradientModule: BackgroundModule<GradientConfig> = {
  id: 'gradient',
  name: 'Fluid Gradient',
  description: 'Organic, moving radial gradients that blend together smoothly.',
  defaultConfig,
  configSchema: [
    { id: 'color1', label: 'Color 1', type: 'color' },
    { id: 'color2', label: 'Color 2', type: 'color' },
    { id: 'color3', label: 'Color 3', type: 'color' },
    { id: 'speed', label: 'Speed', type: 'range', options: { min: 0.1, max: 5, step: 0.1 } },
    { id: 'scale', label: 'Scale', type: 'range', options: { min: 0.5, max: 2, step: 0.1 } },
  ],
  render,
  generateCode
};
