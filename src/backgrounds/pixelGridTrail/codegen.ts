import type { PixelGridTrailConfig } from './types';

export const generateCode = (config: PixelGridTrailConfig) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Pixel Grid Trail</title>
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
    const randomBetween = (min, max) => min + Math.random() * (max - min);

    let width = 0;
    let height = 0;
    let sizeSignature = '';
    let lastTime = performance.now();

    let cols = 0;
    let rows = 0;
    let cellCount = 0;

    let particles = [];
    let cursor = 0;

    let cellStamp = new Uint32Array(0);
    let cellAlpha = new Float32Array(0);
    let cellColorIndex = new Uint8Array(0);
    let frameId = 1;

    let palette = [config.color1, config.color2, config.color3, config.color4, config.color5];

    let baseCanvas = document.createElement('canvas');
    let baseCtx = baseCanvas.getContext('2d');

    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };

    function rebuildBaseLayer() {
      const step = clamp(Math.round(config.gridStep), 2, 40);
      const size = clamp(Math.round(config.cellSize), 1, 40);
      cols = Math.ceil(width / step) + 1;
      rows = Math.ceil(height / step) + 1;
      cellCount = cols * rows;

      cellStamp = new Uint32Array(cellCount);
      cellAlpha = new Float32Array(cellCount);
      cellColorIndex = new Uint8Array(cellCount);
      frameId = 1;

      baseCanvas.width = Math.max(1, Math.round(width));
      baseCanvas.height = Math.max(1, Math.round(height));
      baseCtx = baseCanvas.getContext('2d');
      if (!baseCtx) return;
      baseCtx.clearRect(0, 0, width, height);
      baseCtx.fillStyle = config.baseCellColor;
      for (let y = 0; y < rows; y++) {
        const py = y * step;
        for (let x = 0; x < cols; x++) {
          baseCtx.fillRect(x * step, py, size, size);
        }
      }
    }

    function rebuildParticles() {
      const limit = clamp(Math.round(config.particleLimit), 10, 6000);
      particles = Array.from({ length: limit }, (_, i) => ({
        x: width * 0.5,
        y: height * 0.5,
        vx: randomBetween(-1, 1),
        vy: randomBetween(-1, 1),
        alpha: 0,
        colorIndex: i % 5
      }));
      cursor = 0;
    }

    function rebuild() {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      sizeSignature = Math.round(width) + 'x' + Math.round(height) + ':' + config.gridStep + ':' + config.cellSize + ':' + config.particleLimit;
      pointer.x = width * 0.5;
      pointer.y = height * 0.5;
      pointer.targetX = pointer.x;
      pointer.targetY = pointer.y;
      rebuildBaseLayer();
      rebuildParticles();
    }

    function launchParticle() {
      if (!particles.length) return;
      const p = particles[cursor];
      p.x = pointer.x;
      p.y = pointer.y;
      p.alpha = 1;
      p.colorIndex = cursor % 5;
      const speed = clamp(config.speed, 0.05, 12);
      const angle = randomBetween(0, Math.PI * 2);
      const mag = randomBetween(speed * 0.35, speed);
      p.vx = Math.cos(angle) * mag;
      p.vy = Math.sin(angle) * mag;
      cursor++;
      if (cursor >= particles.length) cursor = 0;
    }

    function animate(now) {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      const frameScale = dt * 60;
      lastTime = now;

      const nextSignature = Math.round(window.innerWidth) + 'x' + Math.round(window.innerHeight) + ':' + config.gridStep + ':' + config.cellSize + ':' + config.particleLimit;
      if (nextSignature !== sizeSignature) rebuild();

      const smooth = clamp(config.pointerSmoothing, 0.01, 0.95);
      pointer.x += (pointer.targetX - pointer.x) * smooth * frameScale;
      pointer.y += (pointer.targetY - pointer.y) * smooth * frameScale;

      const spawnCount = clamp(Math.round(config.spawnPerFrame), 1, 60);
      for (let i = 0; i < spawnCount; i++) launchParticle();

      frameId++;
      if (frameId > 0xfffffff0) {
        cellStamp.fill(0);
        frameId = 1;
      }

      const step = clamp(Math.round(config.gridStep), 2, 40);
      const decay = clamp(config.alphaDecay, 0.0001, 0.1);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const col = Math.floor(p.x / step);
        const row = Math.floor(p.y / step);
        if (col >= 0 && col < cols && row >= 0 && row < rows) {
          const idx = row * cols + col;
          if (cellStamp[idx] !== frameId || p.alpha > cellAlpha[idx]) {
            cellStamp[idx] = frameId;
            cellAlpha[idx] = p.alpha;
            cellColorIndex[idx] = p.colorIndex;
          }
        }

        if (p.alpha > 0) {
          p.alpha -= decay * frameScale;
          if (p.alpha < 0) p.alpha = 0;
        }
        p.x += p.vx * frameScale;
        p.y += p.vy * frameScale;
      }

      ctx.fillStyle = config.backgroundColor;
      ctx.fillRect(0, 0, width, height);
      if (baseCtx) ctx.drawImage(baseCanvas, 0, 0);

      const size = clamp(Math.round(config.cellSize), 1, 40);
      for (let i = 0; i < cellCount; i++) {
        if (cellStamp[i] !== frameId) continue;
        const alpha = cellAlpha[i];
        if (alpha <= 0) continue;
        const col = i % cols;
        const row = Math.floor(i / cols);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = palette[cellColorIndex[i] % palette.length] || palette[0];
        ctx.fillRect(col * step, row * step, size, size);
      }
      ctx.globalAlpha = 1;

      requestAnimationFrame(animate);
    }

    rebuild();
    requestAnimationFrame(animate);

    function pointerMove(clientX, clientY) {
      const rect = canvas.getBoundingClientRect();
      pointer.targetX = clientX - rect.left;
      pointer.targetY = clientY - rect.top;
    }
    canvas.addEventListener('mousemove', (e) => pointerMove(e.clientX, e.clientY), { passive: true });
    canvas.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      if (!touch) return;
      pointerMove(touch.clientX, touch.clientY);
    }, { passive: true });
    window.addEventListener('resize', rebuild);
  </script>
</body>
</html>
`;
