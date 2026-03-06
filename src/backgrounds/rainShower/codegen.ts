import type { RainShowerConfig } from './types';

export const generateCode = (config: RainShowerConfig) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Rain Shower</title>
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
    let dpr = 1;
    let sizeSignature = '';
    let lastTime = performance.now();
    let spawnAccumulator = 0;

    let pointerActive = false;
    let pointerX = 0.5;
    let pointerY = 0.8;

    const rain = [];
    const rainPool = [];
    const drops = [];
    const dropPool = [];
    const dropSpriteCache = new Map();

    let rainColorRgb = hexToRgb(config.rainColor, { r: 80, g: 175, b: 255 });
    let rainStroke = 'rgba(' + rainColorRgb.r + ',' + rainColorRgb.g + ',' + rainColorRgb.b + ',0.52)';

    function updateSize() {
      width = Math.max(1, window.innerWidth);
      height = Math.max(1, window.innerHeight);
      dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function clearParticles() {
      while (rain.length > 0) rainPool.push(rain.pop());
      while (drops.length > 0) dropPool.push(drops.pop());
    }

    function rebuild() {
      updateSize();
      sizeSignature = Math.round(width) + 'x' + Math.round(height) + '@' + dpr.toFixed(2);
      clearParticles();
      spawnAccumulator = 0;
    }

    function getDropSprite(radius) {
      const key = radius.toFixed(2) + '_' + dpr.toFixed(2) + '_' + rainColorRgb.r + '_' + rainColorRgb.g + '_' + rainColorRgb.b;
      const cached = dropSpriteCache.get(key);
      if (cached) return cached;

      const diameter = radius * 2;
      const sprite = document.createElement('canvas');
      sprite.width = Math.max(1, Math.ceil(diameter * dpr));
      sprite.height = Math.max(1, Math.ceil(diameter * dpr));
      const sctx = sprite.getContext('2d');
      if (sctx) {
        sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const gradient = sctx.createRadialGradient(radius, radius, 0.8, radius, radius, radius);
        gradient.addColorStop(0, 'rgba(' + rainColorRgb.r + ',' + rainColorRgb.g + ',' + rainColorRgb.b + ',0.9)');
        gradient.addColorStop(0.45, 'rgba(' + rainColorRgb.r + ',' + rainColorRgb.g + ',' + rainColorRgb.b + ',0.4)');
        gradient.addColorStop(1, 'rgba(' + rainColorRgb.r + ',' + rainColorRgb.g + ',' + rainColorRgb.b + ',0)');
        sctx.fillStyle = gradient;
        sctx.fillRect(0, 0, diameter, diameter);
      }

      dropSpriteCache.set(key, sprite);
      return sprite;
    }

    function spawnRain(count, wind) {
      const fallSpeed = clamp(config.fallSpeed, 280, 2600);
      const expand = Math.abs((height / Math.max(200, fallSpeed)) * wind) + 24;
      const maxRain = clamp(Math.round(config.maxRain), 80, 4000);

      for (let i = 0; i < count; i++) {
        if (rain.length >= maxRain) return;
        const item = rainPool.pop() || { x: 0, y: 0, z: 1, speedFactor: 1, splashed: false };
        item.x = randomBetween(-expand, width + expand);
        item.y = randomBetween(-110, -6);
        item.z = randomBetween(0.5, 1);
        item.speedFactor = randomBetween(0.82, 1.2);
        item.splashed = false;
        rain.push(item);
      }
    }

    function spawnSplash(x) {
      const maxDrops = clamp(Math.round(config.maxDrops), 80, 2600);
      const splashCount = clamp(Math.round(config.splashCount), 0, 30);
      const sizeMin = clamp(Math.round(config.dropSizeMin), 1, 4);
      const sizeMax = clamp(Math.round(config.dropSizeMax), sizeMin, 7);
      const dropMaxSpeed = clamp(config.dropMaxSpeed, 80, 900);

      for (let i = 0; i < splashCount; i++) {
        if (drops.length >= maxDrops) return;
        const drop = dropPool.pop() || { x: 0, y: 0, radius: sizeMin, speedX: 0, speedY: 0 };
        const radius = randomBetween(sizeMin, sizeMax + 0.01);
        const angle = randomBetween(-Math.PI * 0.5, Math.PI * 0.5);
        const speed = randomBetween(dropMaxSpeed * 0.16, dropMaxSpeed * 0.52);
        drop.x = x;
        drop.y = height - 1;
        drop.radius = radius;
        drop.speedX = Math.sin(angle) * speed;
        drop.speedY = -Math.cos(angle) * speed;
        drops.push(drop);
      }
    }

    function onPointerMove(clientX, clientY) {
      const rect = canvas.getBoundingClientRect();
      const nx = (clientX - rect.left) / Math.max(1, rect.width);
      const ny = (clientY - rect.top) / Math.max(1, rect.height);
      pointerX = clamp(nx, 0, 1);
      pointerY = clamp(ny, 0, 1);
      pointerActive = true;
    }

    function handleMouseMove(event) {
      onPointerMove(event.clientX, event.clientY);
    }
    function handleMouseLeave() {
      pointerActive = false;
    }
    function handleTouchMove(event) {
      const touch = event.touches[0];
      if (!touch) return;
      onPointerMove(touch.clientX, touch.clientY);
    }
    function handleTouchEnd() {
      pointerActive = false;
    }

    function draw(wind) {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = config.backgroundColor;
      ctx.fillRect(0, 0, width, height);

      const lineWidth = clamp(config.lineWidth, 0.2, 4);
      const lineLength = clamp(config.lineLength, 6, 90);
      const windLean = wind * 0.04;

      ctx.beginPath();
      for (let i = 0; i < rain.length; i++) {
        const r = rain[i];
        ctx.moveTo(r.x, r.y);
        ctx.lineTo(r.x - windLean * r.z, r.y - lineLength * r.z);
      }
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = rainStroke;
      ctx.stroke();

      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        const diameter = d.radius * 2;
        const sprite = getDropSprite(d.radius);
        ctx.drawImage(sprite, d.x - d.radius, d.y - d.radius, diameter, diameter);
      }
    }

    function animate(now) {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      const nextSignature = Math.round(window.innerWidth) + 'x' + Math.round(window.innerHeight) + '@' + (window.devicePixelRatio || 1).toFixed(2);
      if (nextSignature !== sizeSignature) {
        dropSpriteCache.clear();
        rebuild();
      }

      const pointerWind = config.interaction && pointerActive ? (pointerX - 0.5) * clamp(config.pointerWind, 0, 1200) : 0;
      const activeWind = clamp(config.wind, -1200, 1200) + pointerWind;
      const pointerBoost = config.interaction && pointerActive
        ? 1 + Math.pow(1 - pointerY, 3) * clamp(config.pointerSpawnBoost, 0, 5)
        : 1;
      const spawnRate = clamp(config.spawnRate, 20, 2500) * pointerBoost;

      spawnAccumulator += spawnRate * dt;
      if (spawnAccumulator >= 1) {
        const spawnCount = Math.min(40, Math.floor(spawnAccumulator));
        spawnAccumulator -= spawnCount;
        spawnRain(spawnCount, activeWind);
      }

      const fallSpeed = clamp(config.fallSpeed, 280, 2600);
      const gravity = clamp(config.gravity, 120, 2600);
      const dropMaxSpeed = clamp(config.dropMaxSpeed, 80, 900);

      for (let i = rain.length - 1; i >= 0; i--) {
        const r = rain[i];
        r.y += fallSpeed * r.speedFactor * r.z * dt;
        r.x += activeWind * r.z * dt;

        if (r.y >= height && !r.splashed) {
          r.splashed = true;
          if (config.splashCount > 0) spawnSplash(r.x);
        }
        if (r.y > height + 120 || r.x < -140 || r.x > width + 140) {
          rainPool.push(r);
          rain.splice(i, 1);
        }
      }

      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        d.x += d.speedX * dt;
        d.y += d.speedY * dt;
        d.speedY += gravity * dt;
        d.speedX += activeWind * 0.08 * dt;
        d.speedX = clamp(d.speedX, -dropMaxSpeed, dropMaxSpeed);
        if (d.y > height + d.radius + 6 || d.x < -120 || d.x > width + 120) {
          dropPool.push(d);
          drops.splice(i, 1);
        }
      }

      draw(activeWind);
      requestAnimationFrame(animate);
    }

    rebuild();
    requestAnimationFrame(animate);
    canvas.addEventListener('mousemove', handleMouseMove, { passive: true });
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
    canvas.addEventListener('touchend', handleTouchEnd);
    canvas.addEventListener('touchcancel', handleTouchEnd);
    window.addEventListener('resize', () => {
      dropSpriteCache.clear();
      rebuild();
    });
  </script>
</body>
</html>
`;
