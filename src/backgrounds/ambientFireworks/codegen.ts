import type { AmbientFireworksConfig } from './types';

export const generateCode = (config: AmbientFireworksConfig) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Ambient Fireworks</title>
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
    const TAU = Math.PI * 2;

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

    function randomBrightColor() {
      const r = Math.floor(randomBetween(55, 255));
      const g = Math.floor(randomBetween(55, 255));
      const b = Math.floor(randomBetween(55, 255));
      return 'rgb(' + r + ', ' + g + ', ' + b + ')';
    }

    let width = 0;
    let height = 0;
    let sizeSignature = '';
    let lastTime = performance.now();
    let autoElapsed = 0;

    const particles = [];
    const pool = [];

    function updateSize() {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function recycle(particle) {
      pool.push(particle);
    }

    function createParticle() {
      return pool.pop() || { x: 0, y: 0, vx: 0, vy: 0, size: 2, alpha: 1, color: '#ffffff' };
    }

    function spawnBurst(x, y) {
      const countBase = clamp(Math.round(config.burstCount), 20, 400);
      const jitter = clamp(Math.round(config.burstCountJitter), 0, 220);
      const count = clamp(Math.round(countBase + randomBetween(-jitter, jitter)), 8, 500);
      const limit = clamp(Math.round(config.particleLimit), 120, 6000);
      const speedMin = clamp(config.speedMin, 20, 1200);
      const speedMax = clamp(config.speedMax, speedMin + 1, 1500);
      const sizeMin = clamp(config.particleSizeMin, 0.2, 8);
      const sizeMax = clamp(config.particleSizeMax, sizeMin + 0.1, 12);
      const useFixedColor = config.colorMode === 'fixed';
      const burstColor = useFixedColor ? config.particleColor : randomBrightColor();

      for (let i = 0; i < count; i++) {
        if (particles.length >= limit) return;
        const p = createParticle();
        const angle = randomBetween(0, TAU);
        const speed = randomBetween(speedMin, speedMax);
        p.x = x;
        p.y = y;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
        p.size = randomBetween(sizeMin, sizeMax);
        p.alpha = randomBetween(0.6, 1);
        p.color = burstColor;
        particles.push(p);
      }
    }

    function spawnRandomBurst() {
      const margin = clamp(config.burstMargin, 0, Math.min(width, height) * 0.45);
      const xMin = margin;
      const xMax = Math.max(margin + 1, width - margin);
      const yMin = margin;
      const yMax = Math.max(margin + 1, height - margin);
      spawnBurst(randomBetween(xMin, xMax), randomBetween(yMin, yMax));
    }

    function onPointerDown(x, y) {
      if (!config.clickBurst) return;
      spawnBurst(x, y);
    }

    function handleMouseDown(event) {
      const rect = canvas.getBoundingClientRect();
      onPointerDown(event.clientX - rect.left, event.clientY - rect.top);
    }
    function handleTouchStart(event) {
      const touch = event.touches[0];
      if (!touch) return;
      const rect = canvas.getBoundingClientRect();
      onPointerDown(touch.clientX - rect.left, touch.clientY - rect.top);
    }

    function draw() {
      const fade = clamp(config.fadeAlpha, 0.02, 0.92);
      const bg = hexToRgb(config.backgroundColor, { r: 0, g: 0, b: 0 });

      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(' + bg.r + ',' + bg.g + ',' + bg.b + ',' + fade + ')';
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.alpha <= 0.001) continue;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, TAU);
        ctx.fillStyle = p.color;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }

    function animate(now) {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      const nextSignature = Math.round(window.innerWidth) + 'x' + Math.round(window.innerHeight);
      if (nextSignature !== sizeSignature) {
        updateSize();
        sizeSignature = nextSignature;
        while (particles.length > 0) recycle(particles.pop());
      }

      if (config.autoBurst) {
        const intervalMs = clamp(config.autoBurstInterval, 40, 2500);
        const chance = clamp(config.spawnChance, 0, 0.5);
        autoElapsed += dt * 1000;
        if (autoElapsed >= intervalMs) {
          autoElapsed -= intervalMs;
          spawnRandomBurst();
        } else if (Math.random() < chance) {
          spawnRandomBurst();
        }
      }

      const gravity = clamp(config.gravity, 0, 2200);
      const decay = clamp(config.alphaDecay, 0.08, 2.6);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += gravity * dt;
        p.alpha -= decay * dt;

        if (p.alpha <= 0 || p.y - p.size > height + 120 || p.x < -120 || p.x > width + 120) {
          recycle(p);
          particles.splice(i, 1);
        }
      }

      draw();
      requestAnimationFrame(animate);
    }

    updateSize();
    sizeSignature = Math.round(width) + 'x' + Math.round(height);
    requestAnimationFrame(animate);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('resize', () => {
      updateSize();
      sizeSignature = Math.round(width) + 'x' + Math.round(height);
      while (particles.length > 0) recycle(particles.pop());
    });
  </script>
</body>
</html>
`;
