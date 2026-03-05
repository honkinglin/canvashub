import type { StardustBurstConfig } from './types';

export const generateCode = (config: StardustBurstConfig) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Stardust Burst</title>
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

    const TAU = Math.PI * 2;
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const randomBetween = (min, max) => min + Math.random() * (max - min);

    function hexToRgb(hex) {
      const normalized = hex.trim().replace('#', '');
      const full = normalized.length === 3
        ? normalized.split('').map((char) => char + char).join('')
        : normalized;
      if (!/^[0-9a-fA-F]{6}$/.test(full)) return { r: 255, g: 255, b: 255 };
      return {
        r: parseInt(full.slice(0, 2), 16),
        g: parseInt(full.slice(2, 4), 16),
        b: parseInt(full.slice(4, 6), 16)
      };
    }

    function varyColor(base, variation) {
      const delta = clamp(variation, 0, 180) * 0.5;
      return {
        r: clamp(Math.round(base.r + randomBetween(-delta, delta)), 0, 255),
        g: clamp(Math.round(base.g + randomBetween(-delta, delta)), 0, 255),
        b: clamp(Math.round(base.b + randomBetween(-delta, delta)), 0, 255)
      };
    }

    function makePalette() {
      return [config.colorA, config.colorB, config.colorC, config.colorD].map(hexToRgb);
    }

    let width = 0;
    let height = 0;
    let sizeSignature = '';
    let lastTime = performance.now();
    let lastAutoBurst = performance.now();
    let palette = makePalette();
    const particles = [];

    function updateSize() {
      const dpr = window.devicePixelRatio || 1;
      width = canvas.width / dpr;
      height = canvas.height / dpr;
    }

    function createParticle(x, y) {
      const angle = randomBetween(0, TAU);
      const speed = randomBetween(0.6, clamp(config.maxSpeed, 4, 80));
      const base = palette[Math.floor(Math.random() * palette.length)];
      return {
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: randomBetween(0.8, clamp(config.maxParticleSize, 1, 20)),
        alpha: randomBetween(0.55, 1),
        alphaDecay: randomBetween(0.006, 0.024),
        color: varyColor(base, config.colorVariation)
      };
    }

    function spawnBurst(x, y, countOverride) {
      if (width <= 1 || height <= 1) return;
      const count = countOverride || clamp(Math.round(config.particleCount), 80, 1800);
      for (let i = 0; i < count; i++) particles.push(createParticle(x, y));
      const hardLimit = Math.max(2400, count * 10);
      if (particles.length > hardLimit) {
        particles.splice(0, particles.length - hardLimit);
      }
    }

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      updateSize();
      sizeSignature = Math.round(width) + 'x' + Math.round(height);
      particles.length = 0;
      spawnBurst(width * 0.5, height * 0.5);
    }

    function onClick(event) {
      const rect = canvas.getBoundingClientRect();
      spawnBurst(event.clientX - rect.left, event.clientY - rect.top);
    }

    function onTouchStart(event) {
      const touch = event.touches[0];
      if (!touch) return;
      const rect = canvas.getBoundingClientRect();
      spawnBurst(touch.clientX - rect.left, touch.clientY - rect.top);
    }

    function animate(now) {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      const frameScale = dt * 60;
      lastTime = now;

      updateSize();
      const nextSignature = Math.round(width) + 'x' + Math.round(height);
      if (nextSignature !== sizeSignature) resize();
      if (width <= 1 || height <= 1) {
        requestAnimationFrame(animate);
        return;
      }

      const bg = hexToRgb(config.backgroundColor);
      ctx.fillStyle = 'rgba(' + bg.r + ',' + bg.g + ',' + bg.b + ',' + clamp(config.backgroundFade, 0.04, 1) + ')';
      ctx.fillRect(0, 0, width, height);

      if (config.autoBurst) {
        const interval = clamp(config.autoBurstInterval, 200, 4000);
        if (now - lastAutoBurst >= interval) {
          lastAutoBurst = now;
          const px = width * 0.5 + randomBetween(-width * 0.15, width * 0.15);
          const py = height * 0.5 + randomBetween(-height * 0.15, height * 0.15);
          spawnBurst(px, py, Math.max(20, Math.round(config.particleCount * 0.45)));
        }
      }

      const frictionPow = Math.pow(clamp(config.friction, 0.85, 0.999), frameScale);
      const gravity = clamp(config.gravity, -0.2, 0.4) * frameScale;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vx *= frictionPow;
        p.vy = p.vy * frictionPow + gravity;
        p.x += p.vx * frameScale;
        p.y += p.vy * frameScale;
        p.alpha -= p.alphaDecay * frameScale;

        if (p.alpha <= 0 || p.x < -120 || p.x > width + 120 || p.y < -120 || p.y > height + 120) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, TAU);
        ctx.fillStyle = 'rgba(' + p.color.r + ',' + p.color.g + ',' + p.color.b + ',' + clamp(p.alpha, 0, 1) + ')';
        ctx.fill();
      }

      requestAnimationFrame(animate);
    }

    resize();
    requestAnimationFrame(animate);
    window.addEventListener('resize', resize);
    canvas.addEventListener('click', onClick);
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
  </script>
</body>
</html>
`;
