import type { MagicDustConfig } from './types';

export const generateCode = (config: MagicDustConfig) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Magic Dust</title>
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

    let palette = [hexToRgb(config.colorA), hexToRgb(config.colorB), hexToRgb(config.colorC)];
    const pickColor = () => palette[Math.floor(Math.random() * palette.length)];

    let width = 0;
    let height = 0;
    let sizeSignature = '';
    let pointerX = 0;
    let pointerY = 0;
    let lastTime = performance.now();
    let lastSpawnAt = 0;
    const dusts = [];

    function createDust(x, y, ambient) {
      const speedMin = clamp(config.speedMin, 0.1, 20);
      const speedMax = clamp(config.speedMax, speedMin + 0.1, 40);
      const lifeMin = clamp(config.lifeMin, 0.2, 8);
      const lifeMax = clamp(config.lifeMax, lifeMin + 0.1, 14);
      const sizeMin = clamp(config.sizeMin, 2, 80);
      const sizeMax = clamp(config.sizeMax, sizeMin + 1, 140);

      const angle = randomBetween(0, TAU);
      const velocity = ambient ? randomBetween(speedMin * 0.05, speedMax * 0.2) : randomBetween(speedMin, speedMax);
      const sizeStart = ambient ? randomBetween(sizeMin * 0.35, sizeMin * 0.8) : randomBetween(sizeMin * 0.6, sizeMax * 0.95);
      const sizeEnd = ambient ? randomBetween(sizeStart * 0.3, sizeStart * 0.8) : randomBetween(sizeMin * 0.2, sizeStart * 0.7);
      const life = ambient ? randomBetween(lifeMin * 2, lifeMax * 2.4) : randomBetween(lifeMin, lifeMax);
      const color = pickColor();

      return {
        x, y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        age: 0,
        life,
        sizeStart,
        sizeEnd,
        fadeIn: ambient ? 0.2 : randomBetween(0.08, 0.3),
        fadeOut: ambient ? 0.4 : randomBetween(0.8, 1.8),
        rotation: randomBetween(0, 360),
        rotationVelocity: randomBetween(-220, 220),
        color,
        ambient
      };
    }

    function spawnAmbient() {
      const target = clamp(Math.round(config.ambientCount), 0, 1800);
      const ambientNow = dusts.filter((d) => d.ambient).length;
      for (let i = ambientNow; i < target; i++) {
        dusts.push(createDust(randomBetween(0, width), randomBetween(0, height), true));
      }
    }

    function spawnBurst(x, y, count) {
      for (let i = 0; i < count; i++) dusts.push(createDust(x, y, false));
      if (dusts.length > 4000) dusts.splice(0, dusts.length - 4000);
    }

    function onPointerMove(x, y) {
      const rect = canvas.getBoundingClientRect();
      pointerX = x - rect.left;
      pointerY = y - rect.top;
      const now = performance.now();
      if (now - lastSpawnAt >= clamp(config.spawnInterval, 4, 120)) {
        lastSpawnAt = now;
        spawnBurst(pointerX, pointerY, clamp(Math.round(config.burstCount), 1, 40));
      }
    }

    function resize(hard) {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeSignature = Math.round(width) + 'x' + Math.round(height);
      pointerX = width * 0.5;
      pointerY = height * 0.5;
      if (hard) dusts.length = 0;
      spawnAmbient();
    }

    function animate(now) {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      const frameScale = dt * 60;
      lastTime = now;

      const nextSignature = Math.round(width) + 'x' + Math.round(height);
      if (nextSignature !== sizeSignature) resize(true);
      if (width <= 1 || height <= 1) {
        requestAnimationFrame(animate);
        return;
      }

      const bg = hexToRgb(config.backgroundColor);
      ctx.fillStyle = 'rgba(' + bg.r + ',' + bg.g + ',' + bg.b + ',' + clamp(config.trailFade, 0.02, 1) + ')';
      ctx.fillRect(0, 0, width, height);

      const gravity = clamp(config.gravity, -1, 2);
      const glow = clamp(config.glowStrength, 0.1, 3);

      for (let i = dusts.length - 1; i >= 0; i--) {
        const d = dusts[i];
        d.age += dt;
        d.vy += gravity * dt;
        d.x += d.vx * frameScale;
        d.y += d.vy * frameScale;
        d.rotation += d.rotationVelocity * dt;

        const t = clamp(d.age / Math.max(0.001, d.life), 0, 1);
        const size = d.sizeStart + (d.sizeEnd - d.sizeStart) * t;

        let alpha = 1;
        if (t < d.fadeIn) alpha = t / Math.max(0.001, d.fadeIn);
        else if (t > d.fadeOut) alpha = 1 - (t - d.fadeOut) / Math.max(0.001, 1 - d.fadeOut);
        alpha = clamp(alpha, 0, 1);

        if (alpha <= 0 || d.x < -140 || d.x > width + 140 || d.y < -140 || d.y > height + 140) {
          if (d.ambient) dusts[i] = createDust(randomBetween(0, width), randomBetween(0, height), true);
          else dusts.splice(i, 1);
          continue;
        }

        const radius = Math.max(1, size * 0.5);
        const grad = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, radius * 1.4);
        grad.addColorStop(0, 'rgba(' + d.color.r + ',' + d.color.g + ',' + d.color.b + ',' + (alpha * 0.95) + ')');
        grad.addColorStop(0.16, 'rgba(' + d.color.r + ',' + d.color.g + ',' + d.color.b + ',' + (alpha * 0.24 * glow) + ')');
        grad.addColorStop(0.7, 'rgba(' + d.color.r + ',' + d.color.g + ',' + d.color.b + ',' + (alpha * 0.06 * glow) + ')');
        grad.addColorStop(1, 'rgba(' + d.color.r + ',' + d.color.g + ',' + d.color.b + ',0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(d.x, d.y, radius * 1.4, 0, TAU);
        ctx.fill();
      }

      spawnAmbient();
      requestAnimationFrame(animate);
    }

    resize(true);
    requestAnimationFrame(animate);
    window.addEventListener('resize', () => resize(true));
    canvas.addEventListener('mousemove', (e) => onPointerMove(e.clientX, e.clientY), { passive: true });
    canvas.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      if (!touch) return;
      onPointerMove(touch.clientX, touch.clientY);
    }, { passive: true });
  </script>
</body>
</html>
`;
