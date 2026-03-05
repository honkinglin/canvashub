import type { GradientConfig } from './types';
export const generateCode = (config: GradientConfig) => `<!doctype html>
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
