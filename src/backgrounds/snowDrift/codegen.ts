import type { SnowDriftConfig } from './types';

export const generateCode = (config: SnowDriftConfig) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Snow Drift</title>
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

    const AREA_BASE = 10000;
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const randomBetween = (min, max) => min + Math.random() * (max - min);

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

    let width = 0;
    let height = 0;
    let sizeSignature = '';
    let lastTime = performance.now();

    let bgRgb = hexToRgb(config.backgroundColor, { r: 10, g: 16, b: 32 });
    let snowRgb = hexToRgb(config.snowColor, { r: 246, g: 249, b: 250 });
    let snowColor = 'rgb(' + snowRgb.r + ',' + snowRgb.g + ',' + snowRgb.b + ')';

    const flakes = [];
    let pointerActive = false;
    let pointerNormX = 0.5;

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

    function resetFlake(flake, fromTop) {
      const sizeMin = clamp(config.sizeMin, 0.2, 12);
      const sizeMax = clamp(config.sizeMax, sizeMin + 0.1, 18);
      const speedMin = clamp(config.speedMin, 1, 400);
      const speedMax = clamp(config.speedMax, speedMin + 1, 500);
      const driftMin = clamp(config.driftMin, -400, 400);
      const driftMax = clamp(config.driftMax, driftMin, 400);

      flake.size = randomBetween(sizeMin, sizeMax);
      flake.x = randomBetween(-flake.size, width + flake.size);
      flake.y = fromTop ? randomBetween(-flake.size * 2, 0) : randomBetween(0, height);
      flake.dx = randomBetween(driftMin, driftMax);
      flake.dy = randomBetween(speedMin, speedMax);
      flake.alpha = randomBetween(0.35, 0.95);
      flake.phase = randomBetween(0, Math.PI * 2);
      flake.phaseSpeed = randomBetween(0.6, 2.4);
    }

    function syncCount(resetAll) {
      const target = clamp(
        Math.round((width * height * clamp(config.density, 0.1, 8)) / AREA_BASE),
        20,
        clamp(Math.round(config.particleLimit), 20, 6000)
      );

      while (flakes.length < target) {
        const flake = { x: 0, y: 0, dx: 0, dy: 0, size: 2, alpha: 1, phase: 0, phaseSpeed: 1 };
        resetFlake(flake, false);
        flakes.push(flake);
      }
      if (flakes.length > target) {
        flakes.length = target;
      }
      if (resetAll) {
        for (let i = 0; i < flakes.length; i++) resetFlake(flakes[i], false);
      }
    }

    function onPointerMove(clientX) {
      const rect = canvas.getBoundingClientRect();
      pointerNormX = clamp((clientX - rect.left) / Math.max(1, rect.width), 0, 1);
      pointerActive = true;
    }

    function handleMouseMove(event) { onPointerMove(event.clientX); }
    function handleMouseLeave() {
      pointerActive = false;
      pointerNormX = 0.5;
    }
    function handleTouchMove(event) {
      const touch = event.touches[0];
      if (!touch) return;
      onPointerMove(touch.clientX);
    }
    function handleTouchEnd() {
      pointerActive = false;
      pointerNormX = 0.5;
    }

    function rebuild() {
      updateSize();
      sizeSignature = Math.round(width) + 'x' + Math.round(height);
      syncCount(true);
    }

    function draw(dt) {
      const fade = clamp(config.fadeAlpha, 0.02, 1);
      if (fade >= 0.999) ctx.fillStyle = config.backgroundColor;
      else ctx.fillStyle = 'rgba(' + bgRgb.r + ',' + bgRgb.g + ',' + bgRgb.b + ',' + fade + ')';
      ctx.fillRect(0, 0, width, height);

      const sway = clamp(config.swayAmount, 0, 240);
      const baseWind = clamp(config.wind, -600, 600);
      const pointerWind = config.interaction && pointerActive ? (pointerNormX - 0.5) * clamp(config.pointerWind, 0, 600) : 0;
      const activeWind = baseWind + pointerWind;

      for (let i = 0; i < flakes.length; i++) {
        const f = flakes[i];
        f.phase += f.phaseSpeed * dt;
        const swayForce = Math.sin(f.phase) * sway;

        f.x += (f.dx + activeWind + swayForce) * dt;
        f.y += f.dy * dt;

        if (f.y > height + f.size) {
          resetFlake(f, true);
          continue;
        }
        if (f.x > width + f.size) f.x = -f.size;
        else if (f.x < -f.size) f.x = width + f.size;

        ctx.globalAlpha = f.alpha;
        ctx.fillStyle = snowColor;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
    }

    function animate(now) {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      const nextSignature = Math.round(window.innerWidth) + 'x' + Math.round(window.innerHeight);
      if (nextSignature !== sizeSignature) rebuild();

      syncCount(false);
      draw(dt);
      requestAnimationFrame(animate);
    }

    rebuild();
    requestAnimationFrame(animate);
    canvas.addEventListener('mousemove', handleMouseMove, { passive: true });
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
    canvas.addEventListener('touchend', handleTouchEnd);
    canvas.addEventListener('touchcancel', handleTouchEnd);
    window.addEventListener('resize', rebuild);
  </script>
</body>
</html>
`;
