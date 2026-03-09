import type { PixelFieldConfig } from './types';

export const generateCode = (config: PixelFieldConfig) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Pixel Field</title>
  <style>
    html, body { margin: 0; width: 100%; height: 100%; overflow: hidden; background: ${config.backgroundColor}; }
    canvas { display: block; width: 100%; height: 100%; }
  </style>
</head>
<body>
  <canvas id="canvas"></canvas>
  <script>
    const config = ${JSON.stringify(config, null, 2)};
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

    function hexToRgb(hex, fallback) {
      const normalized = hex.trim().replace('#', '');
      const full = normalized.length === 3
        ? normalized.split('').map((char) => char + char).join('')
        : normalized;
      if (!/^[0-9a-fA-F]{6}$/.test(full)) return fallback;
      return {
        r: parseInt(full.slice(0, 2), 16),
        g: parseInt(full.slice(2, 4), 16),
        b: parseInt(full.slice(4, 6), 16)
      };
    }

    let viewW = 0;
    let viewH = 0;
    let simW = 0;
    let simH = 0;
    let rows = 0;
    let cols = 0;
    let count = 0;
    let offsetX = 0;
    let offsetY = 0;
    let sizeSignature = '';
    let frameToggle = false;
    let color = hexToRgb(config.particleColor, { r: 220, g: 220, b: 220 });

    let x = new Float32Array(0);
    let y = new Float32Array(0);
    let ox = new Float32Array(0);
    let oy = new Float32Array(0);
    let vx = new Float32Array(0);
    let vy = new Float32Array(0);

    let imageData = ctx.createImageData(1, 1);
    let buffer = imageData.data;
    const pixelCanvas = document.createElement('canvas');
    let pixelCtx = pixelCanvas.getContext('2d');

    let mouseX = 0;
    let mouseY = 0;
    let manual = false;

    function pointerMove(clientX, clientY) {
      const rect = canvas.getBoundingClientRect();
      mouseX = clientX - rect.left - offsetX;
      mouseY = clientY - rect.top - offsetY;
      manual = true;
    }

    function buildGrid() {
      rows = clamp(Math.round(config.rows), 4, 280);
      cols = clamp(Math.round(config.cols), 4, 520);
      const spacing = clamp(Math.round(config.spacing), 1, 12);
      const margin = clamp(Math.round(config.margin), 0, 420);

      simW = cols * spacing + margin * 2;
      simH = rows * spacing + margin * 2;
      count = rows * cols;

      x = new Float32Array(count);
      y = new Float32Array(count);
      ox = new Float32Array(count);
      oy = new Float32Array(count);
      vx = new Float32Array(count);
      vy = new Float32Array(count);

      for (let i = 0; i < count; i++) {
        const px = margin + spacing * (i % cols);
        const py = margin + spacing * Math.floor(i / cols);
        x[i] = px;
        y[i] = py;
        ox[i] = px;
        oy[i] = py;
      }

      pixelCanvas.width = Math.max(1, simW);
      pixelCanvas.height = Math.max(1, simH);
      pixelCtx = pixelCanvas.getContext('2d');
      if (pixelCtx) imageData = pixelCtx.createImageData(Math.max(1, simW), Math.max(1, simH));
      else imageData = ctx.createImageData(Math.max(1, simW), Math.max(1, simH));
      buffer = imageData.data;
    }

    function rebuild() {
      const dpr = window.devicePixelRatio || 1;
      viewW = Math.max(1, window.innerWidth);
      viewH = Math.max(1, window.innerHeight);
      canvas.width = Math.floor(viewW * dpr);
      canvas.height = Math.floor(viewH * dpr);
      canvas.style.width = viewW + 'px';
      canvas.style.height = viewH + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      sizeSignature = viewW + 'x' + viewH + ':' + config.rows + 'x' + config.cols + ':' + config.spacing + ':' + config.margin;
      buildGrid();
      offsetX = Math.round((viewW - simW) * 0.5);
      offsetY = Math.round((viewH - simH) * 0.5);
      manual = false;
      mouseX = simW * 0.5;
      mouseY = simH * 0.5;
    }

    function updatePhysics(time) {
      const thickness = clamp(config.thickness, 1, 500);
      const thicknessSq = thickness * thickness;
      const drag = clamp(config.drag, 0.5, 0.9995);
      const ease = clamp(config.ease, 0.001, 0.9);

      if (!manual && config.autoMotion) {
        const t = time * 0.001;
        const scale = clamp(config.motionScale, 0.02, 0.9);
        mouseX = simW * 0.5 + Math.cos(t * 2.1) * Math.cos(t * 0.9) * simW * scale;
        mouseY = simH * 0.5 + Math.sin(t * 3.2) * Math.tan(Math.sin(t * 0.8)) * simH * scale;
        mouseY = clamp(mouseY, -simH, simH * 2);
      }

      for (let i = 0; i < count; i++) {
        const dx = mouseX - x[i];
        const dy = mouseY - y[i];
        const distSq = dx * dx + dy * dy + 0.0001;

        if (distSq < thicknessSq) {
          const invDist = 1 / Math.sqrt(distSq);
          const f = -thicknessSq / distSq;
          vx[i] += f * dx * invDist;
          vy[i] += f * dy * invDist;
        }

        vx[i] *= drag;
        vy[i] *= drag;
        x[i] += vx[i] + (ox[i] - x[i]) * ease;
        y[i] += vy[i] + (oy[i] - y[i]) * ease;
      }
    }

    function renderPixels() {
      buffer.fill(0);
      for (let i = 0; i < count; i++) {
        const px = x[i] | 0;
        const py = y[i] | 0;
        if (px < 0 || px >= simW || py < 0 || py >= simH) continue;
        const n = (px + py * simW) * 4;
        buffer[n] = color.r;
        buffer[n + 1] = color.g;
        buffer[n + 2] = color.b;
        buffer[n + 3] = 255;
      }

      ctx.fillStyle = config.backgroundColor;
      ctx.fillRect(0, 0, viewW, viewH);
      if (pixelCtx) {
        pixelCtx.putImageData(imageData, 0, 0);
        ctx.drawImage(pixelCanvas, offsetX, offsetY);
      } else {
        ctx.putImageData(imageData, offsetX, offsetY);
      }
    }

    function animate(time) {
      const nextSignature = window.innerWidth + 'x' + window.innerHeight + ':' + config.rows + 'x' + config.cols + ':' + config.spacing + ':' + config.margin;
      if (nextSignature !== sizeSignature) rebuild();

      if (config.interlace) {
        frameToggle = !frameToggle;
        if (frameToggle) updatePhysics(time);
        else renderPixels();
      } else {
        updatePhysics(time);
        renderPixels();
      }

      requestAnimationFrame(animate);
    }

    rebuild();
    requestAnimationFrame(animate);

    canvas.addEventListener('mousemove', (e) => pointerMove(e.clientX, e.clientY), { passive: true });
    canvas.addEventListener('mouseleave', () => { manual = false; });
    canvas.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      if (!touch) return;
      pointerMove(touch.clientX, touch.clientY);
    }, { passive: true });
    canvas.addEventListener('touchend', () => { manual = false; });
    canvas.addEventListener('touchcancel', () => { manual = false; });
    window.addEventListener('resize', rebuild);
  </script>
</body>
</html>
`;
