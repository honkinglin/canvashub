import type { BranchLinesConfig } from './types';

export const generateCode = (config: BranchLinesConfig) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Branch Lines</title>
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

    const DIRS = [
      { x: 0, y: 1 },
      { x: 1, y: 0 },
      { x: 0, y: -1 },
      { x: -1, y: 0 },
      { x: 0.7, y: 0.7 },
      { x: 0.7, y: -0.7 },
      { x: -0.7, y: 0.7 },
      { x: -0.7, y: -0.7 }
    ];

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const randomBetween = (min, max) => min + Math.random() * (max - min);

    function hexToRgb(hex) {
      const normalized = hex.trim().replace('#', '');
      const full = normalized.length === 3
        ? normalized.split('').map((char) => char + char).join('')
        : normalized;
      if (!/^[0-9a-fA-F]{6}$/.test(full)) return { r: 34, g: 34, b: 34 };
      return {
        r: parseInt(full.slice(0, 2), 16),
        g: parseInt(full.slice(2, 4), 16),
        b: parseInt(full.slice(4, 6), 16)
      };
    }

    function pickDirection(parent) {
      let dir = DIRS[Math.floor(Math.random() * DIRS.length)];
      let guard = 0;
      while (
        guard < 16 &&
        ((dir.x === parent.nx && dir.y === parent.ny) || (dir.x === -parent.nx && dir.y === -parent.ny))
      ) {
        dir = DIRS[Math.floor(Math.random() * DIRS.length)];
        guard += 1;
      }
      return dir;
    }

    let width = 0;
    let height = 0;
    let sizeSignature = '';
    let bg = hexToRgb(config.backgroundColor);
    let lines = [];
    let frame = 0;
    let sinceLastSpawn = 0;
    let lastTime = performance.now();

    const starter = { x: 0, y: 0, vx: 0, vy: 0, nx: 0, ny: 0, width: config.initialWidth };

    function getColor(x) {
      const hue = (x / Math.max(1, width)) * 360 + frame;
      return 'hsl(' + hue + ', 80%, 50%)';
    }

    function makeLine(parent) {
      const dir = pickDirection(parent);
      const speed = clamp(config.speed, 0.2, 20);
      const minDist = clamp(config.minDist, 2, 80);
      const maxDist = clamp(config.maxDist, minDist + 1, 120);
      const widthDecay = clamp(config.widthDecay, 1.05, 2.5);
      return {
        x: parent.x,
        y: parent.y,
        nx: dir.x,
        ny: dir.y,
        vx: dir.x * speed,
        vy: dir.y * speed,
        width: parent.width / widthDecay,
        dist: randomBetween(minDist, maxDist)
      };
    }

    function updateSize() {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeSignature = Math.round(width) + 'x' + Math.round(height);
    }

    function init() {
      updateSize();
      starter.x = width * 0.5;
      starter.y = height * 0.5;
      starter.width = clamp(config.initialWidth, 1, 28);
      lines = [];
      sinceLastSpawn = 0;
      frame = 0;

      const count = clamp(Math.round(config.initialLines), 1, 40);
      for (let i = 0; i < count; i++) lines.push(makeLine(starter));

      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgb(' + bg.r + ',' + bg.g + ',' + bg.b + ')';
      ctx.fillRect(0, 0, width, height);
    }

    function animate(now) {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      const frameScale = dt * 60;
      lastTime = now;

      const nextSignature = Math.round(width) + 'x' + Math.round(height);
      if (nextSignature !== sizeSignature) init();
      if (width <= 1 || height <= 1) {
        requestAnimationFrame(animate);
        return;
      }

      frame += clamp(config.hueShiftSpeed, 0, 8) * frameScale;

      ctx.globalCompositeOperation = 'source-over';
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(' + bg.r + ',' + bg.g + ',' + bg.b + ',' + clamp(config.trailFade, 0.001, 0.25) + ')';
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = 'lighter';
      ctx.shadowBlur = clamp(config.shadowBlur, 0, 8);

      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i];
        const prevX = line.x;
        const prevY = line.y;
        line.x += line.vx * frameScale;
        line.y += line.vy * frameScale;
        line.dist -= frameScale;

        let dead = false;
        if (line.x < 0 || line.x > width || line.y < 0 || line.y > height) dead = true;

        if (!dead && line.dist <= 0 && line.width > 1) {
          const minDist = clamp(config.minDist, 2, 80);
          const maxDist = clamp(config.maxDist, minDist + 1, 120);
          line.dist = randomBetween(minDist, maxDist);
          const limit = clamp(Math.round(config.maxLines), 10, 800);
          if (lines.length < limit) lines.push(makeLine(line));
          if (lines.length < limit && Math.random() < clamp(config.branchChance, 0, 1)) lines.push(makeLine(line));
          if (Math.random() < clamp(config.dieChance, 0, 1)) dead = true;
        }

        ctx.strokeStyle = ctx.shadowColor = getColor(line.x);
        ctx.lineWidth = line.width;
        ctx.beginPath();
        ctx.moveTo(line.x, line.y);
        ctx.lineTo(prevX, prevY);
        ctx.stroke();

        if (dead) lines.splice(i, 1);
      }

      sinceLastSpawn += frameScale;
      if (
        lines.length < clamp(Math.round(config.maxLines), 10, 800) &&
        sinceLastSpawn > clamp(config.spawnInterval, 1, 80) &&
        Math.random() < clamp(config.spawnChance, 0, 1)
      ) {
        sinceLastSpawn = 0;
        lines.push(makeLine(starter));
        ctx.fillStyle = ctx.shadowColor = getColor(starter.x);
        ctx.beginPath();
        ctx.arc(starter.x, starter.y, clamp(config.initialWidth, 1, 28), 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(animate);
    }

    init();
    requestAnimationFrame(animate);
    window.addEventListener('resize', init);
  </script>
</body>
</html>
`;
