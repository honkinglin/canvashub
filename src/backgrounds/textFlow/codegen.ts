import type { TextFlowConfig } from './types';
export const generateCode = (config: TextFlowConfig) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Text Flow Particles</title>
  <style>
    html, body { margin: 0; width: 100%; height: 100%; overflow: hidden; background: ${config.backgroundColor}; }
    canvas { display: block; width: 100%; height: 100%; }
  </style>
</head>
<body>
  <canvas id="canvas"></canvas>
  <script>
    const config = ${JSON.stringify(config, null, 2)};
    const COLORS = [
      '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
      '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50',
      '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'
    ];

    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const randomBetween = (min, max) => min + Math.random() * (max - min);
    const vectorFromAngle = (angle, magnitude) => ({ x: Math.cos(angle) * magnitude, y: Math.sin(angle) * magnitude });
    const mapRange = (value, inMin, inMax, outMin, outMax) => {
      if (Math.abs(inMax - inMin) < 1e-6) return outMin;
      const t = clamp((value - inMin) / (inMax - inMin), 0, 1);
      return outMin + (outMax - outMin) * t;
    };
    const hashNoise = (x, y) => {
      const v = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453123;
      return v - Math.floor(v);
    };

    function wrapTextByWidth(ctx, text, maxWidth) {
      const lines = [];
      const normalized = text.replace(/\r/g, '');
      const paragraphs = normalized.split('\n');

      for (const paragraph of paragraphs) {
        const chars = Array.from(paragraph);
        if (!chars.length) {
          lines.push(' ');
          continue;
        }

        let current = '';
        for (const char of chars) {
          const next = current + char;
          if (current && ctx.measureText(next).width > maxWidth) {
            lines.push(current);
            current = char;
          } else {
            current = next;
          }
        }
        if (current) lines.push(current);
      }

      return lines.length ? lines : ['Canvas'];
    }

    function truncateLinesToFit(ctx, lines, maxWidth, maxLines) {
      const output = lines.slice(0, maxLines);
      const needsEllipsis = lines.length > maxLines;
      if (needsEllipsis && output.length) {
        let last = output[output.length - 1];
        while (last.length > 1 && ctx.measureText(last + '…').width > maxWidth) {
          last = last.slice(0, -1);
        }
        output[output.length - 1] = last + '…';
      }

      for (let i = 0; i < output.length; i++) {
        let line = output[i];
        while (line.length > 1 && ctx.measureText(line).width > maxWidth) {
          line = line.slice(0, -1);
        }
        output[i] = line;
      }

      return output.length ? output : ['Canvas'];
    }

    function fitMultiLineFontSize(ctx, text, maxWidth, maxHeight, maxLines, maxFont, minFont) {
      const min = minFont || 16;
      const hiCap = Math.max(min, maxFont);
      let low = min;
      let high = hiCap;
      let best = min;
      let bestLines = [text];

      for (let i = 0; i < 24; i++) {
        const mid = (low + high) * 0.5;
        ctx.font = '700 ' + mid + 'px "SF Pro Display", "Segoe UI", sans-serif';
        const lines = wrapTextByWidth(ctx, text, maxWidth);
        const lineHeight = mid * 1.04;
        const blockHeight = lines.length * lineHeight;
        const fits = lines.length <= maxLines && blockHeight <= maxHeight;

        if (fits) {
          best = mid;
          bestLines = lines;
          low = mid;
        } else {
          high = mid;
        }
      }

      ctx.font = '700 ' + best + 'px "SF Pro Display", "Segoe UI", sans-serif';
      const lines = truncateLinesToFit(ctx, bestLines, maxWidth, maxLines);
      return { fontSize: clamp(best, min, hiCap), lines };
    }

    let width = 0;
    let height = 0;
    let fieldStep = 20;
    let fieldCols = 0;
    let fieldRows = 0;
    let flowField = [];
    let spawnPoints = [];
    let particles = [];
    let particleBaseSize = 8;
    let lastNow = performance.now();

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

    function buildSpawnPoints() {
      const off = document.createElement('canvas');
      const offCtx = off.getContext('2d');
      off.width = width;
      off.height = height;
      offCtx.clearRect(0, 0, width, height);
      offCtx.fillStyle = '#000';
      offCtx.textAlign = 'center';
      offCtx.textBaseline = 'middle';

      const text = (config.text || 'Hello').trim() || 'Hello';
      const targetWidth = Math.min(width, 1800) * 0.97;
      const maxFont = Math.min(width, height) * 0.72;
      const maxByHeight = height * 0.82;
      const fitted = fitMultiLineFontSize(
        offCtx,
        text,
        targetWidth,
        maxByHeight,
        3,
        Math.min(maxFont, maxByHeight),
        16
      );
      offCtx.font = '700 ' + fitted.fontSize + 'px "SF Pro Display", "Segoe UI", sans-serif';
      const lineHeight = fitted.fontSize * 1.04;
      const startY = height * 0.5 - ((fitted.lines.length - 1) * lineHeight) / 2;
      for (let i = 0; i < fitted.lines.length; i++) {
        offCtx.fillText(fitted.lines[i], width * 0.5, startY + i * lineHeight);
      }

      const density = clamp(config.density, 1, 4);
      const baseStep = Math.floor(Math.max(width, height) / Math.min(160, Math.min(width, height)));
      const step = Math.max(2, Math.floor(baseStep / density) || 2);
      particleBaseSize = step * 3 * clamp(config.particleScale, 0.4, 2.4);

      const image = offCtx.getImageData(0, 0, width, height).data;
      spawnPoints = [];
      for (let x = 0; x < width; x += step) {
        for (let y = 0; y < height; y += step) {
          const sx = Math.min(width - 1, x + Math.floor(step / 2));
          const sy = Math.min(height - 1, y + Math.floor(step / 2));
          const idx = (sy * width + sx) * 4 + 3;
          if (image[idx] > 6) spawnPoints.push({ x: sx, y: sy });
        }
      }

      const limit = clamp(Math.floor(config.particleLimit), 100, 5000);
      if (spawnPoints.length > limit) {
        for (let i = spawnPoints.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [spawnPoints[i], spawnPoints[j]] = [spawnPoints[j], spawnPoints[i]];
        }
        spawnPoints.length = limit;
      }
    }

    function buildField() {
      fieldStep = Math.max(8, Math.floor(Math.max(width, height) / Math.min(20, Math.min(width, height))));
      fieldCols = Math.ceil(width / fieldStep) + 1;
      fieldRows = Math.ceil(height / fieldStep) + 1;
      flowField = new Array(fieldCols * fieldRows);
      let i = 0;
      for (let y = 0; y < fieldRows; y++) {
        for (let x = 0; x < fieldCols; x++) {
          i += 1;
          flowField[y * fieldCols + x] = hashNoise(i, x * 0.41 + y * 0.73) * Math.PI * 2;
        }
      }
    }

    function createParticle(spawn, now) {
      const p = {
        spawn,
        x: spawn.x,
        y: spawn.y,
        vx: 0,
        vy: 0,
        ax: 0,
        ay: 0,
        size: particleBaseSize * randomBetween(0.5, 1.5),
        baseSize: particleBaseSize,
        start: now,
        duration: clamp(config.lifeSpan, 100, 2000) * randomBetween(0.2, 1.2),
        drag: randomBetween(0.9, 1),
        color: COLORS[Math.floor(Math.random() * COLORS.length)]
      };
      const burst = vectorFromAngle(randomBetween(0, Math.PI * 2), randomBetween(0, 10));
      p.vx += burst.x;
      p.vy += burst.y;
      return p;
    }

    function resetParticle(p, now) {
      const spawn = spawnPoints[Math.floor(Math.random() * spawnPoints.length)] || { x: width * 0.5, y: height * 0.5 };
      p.spawn = spawn;
      p.x = spawn.x;
      p.y = spawn.y;
      p.vx = 0;
      p.vy = 0;
      p.ax = 0;
      p.ay = 0;
      p.size = p.baseSize * randomBetween(0.5, 1.5);
      p.start = now;
      p.duration = clamp(config.lifeSpan, 100, 2000) * randomBetween(0.2, 1.2);
      p.drag = randomBetween(0.9, 1);
      p.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const burst = vectorFromAngle(randomBetween(0, Math.PI * 2), randomBetween(0, 10));
      p.vx += burst.x;
      p.vy += burst.y;
    }

    function rebuildParticles() {
      buildSpawnPoints();
      const now = performance.now();
      particles = spawnPoints.map((point) => createParticle(point, now));
      if (!particles.length) particles = [createParticle({ x: width * 0.5, y: height * 0.5 }, now)];
    }

    function rebuildAll() {
      resize();
      buildField();
      rebuildParticles();
    }

    function animate(now) {
      const dt = Math.min(0.05, (now - lastNow) / 1000);
      const dt60 = dt * 60;
      lastNow = now;

      const gDir = clamp(config.gravityDirection, 0, 360) * Math.PI / 180;
      const gravity = vectorFromAngle(gDir, clamp(config.gravityForce, 0, 100));
      const flowMag = clamp(config.flow, 0, 100);
      const topSpeed = clamp(config.topSpeed, 10, 1000);

      ctx.fillStyle = config.backgroundColor;
      ctx.fillRect(0, 0, width, height);

      for (const p of particles) {
        const col = clamp(Math.floor(p.x / fieldStep), 0, Math.max(0, fieldCols - 1));
        const row = clamp(Math.floor(p.y / fieldStep), 0, Math.max(0, fieldRows - 1));
        const angle = flowField[row * fieldCols + col] + config.flowOffset;
        const flowForce = vectorFromAngle(angle, flowMag);

        p.ax += gravity.x + flowForce.x;
        p.ay += gravity.y + flowForce.y;

        p.vx += p.ax * dt60;
        p.vy += p.ay * dt60;

        const speed = Math.hypot(p.vx, p.vy);
        if (speed > topSpeed) {
          const ratio = topSpeed / speed;
          p.vx *= ratio;
          p.vy *= ratio;
        }

        const dragPow = Math.pow(p.drag, dt60);
        p.vx *= dragPow;
        p.vy *= dragPow;

        p.x += p.vx * dt60 * (1 / 60);
        p.y += p.vy * dt60 * (1 / 60);

        p.ax = 0;
        p.ay = 0;

        const age = now - p.start;
        const life = Math.max(1, p.duration);
        let scale = 1;
        if (age < life * 0.1) scale = mapRange(age, 0, life * 0.1, 0, 1);
        else if (age > life * 0.5) scale = mapRange(age, life * 0.5, life, 1, 0);

        const speedScale = mapRange(Math.hypot(p.vx, p.vy), 0, topSpeed, 0.5, 1.2);
        const radius = p.size * scale * speedScale * 0.5;

        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        if (p.y > height + 16 || age > life) {
          resetParticle(p, now);
        }
      }

      requestAnimationFrame(animate);
    }

    rebuildAll();
    requestAnimationFrame(animate);
    window.addEventListener('resize', rebuildAll);
  </script>
</body>
</html>
`;
