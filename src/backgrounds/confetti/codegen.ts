import type { ConfettiConfig } from './types';
export const generateCode = (config: ConfettiConfig) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confetti Drift</title>
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

    function createPalette() {
      return [config.colorA, config.colorB, config.colorC, config.colorD, config.colorE].map(hexToRgb);
    }

    let palette = createPalette();
    let width = 0;
    let height = 0;
    let sizeSignature = '';
    let lastTime = performance.now();
    let time = 0;
    let particles = [];

    const pointer = { xNorm: 0.5, targetXNorm: 0.5, active: false };

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

    function spawnParticle(fromTop) {
      const sizeMin = clamp(config.sizeMin, 1, 16);
      const sizeMax = clamp(config.sizeMax, sizeMin + 0.1, 24);
      const drift = clamp(config.horizontalDrift, 0, 5);
      const r = randomBetween(sizeMin, sizeMax);
      return {
        x: randomBetween(-r * 2, width - r * 2),
        y: fromTop ? randomBetween(-30, -r * 2) : randomBetween(-r * 2, height - r * 2),
        vx: randomBetween(-drift, drift) + (pointer.xNorm - 0.5) * clamp(config.mouseInfluence, 0, 4) * 5,
        vy: clamp(config.fallSpeed, 0.2, 6) * randomBetween(0.55, 1.5) + r * 0.08,
        r,
        opacity: fromTop ? randomBetween(0.05, 0.4) : randomBetween(0.35, 1),
        dop: clamp(config.fadeSpeed, 0.005, 0.2) * randomBetween(0.8, 2.6),
        color: palette[Math.floor(Math.random() * palette.length)],
        seed: Math.random() * Math.PI * 2
      };
    }

    function syncCount() {
      if (width <= 1 || height <= 1) return;
      const count = clamp(Math.round(config.confettiCount), 20, 1200);
      while (particles.length < count) particles.push(spawnParticle(false));
      if (particles.length > count) particles.length = count;
    }

    function rebuild() {
      resize();
      sizeSignature = Math.round(width) + 'x' + Math.round(height);
      if (width <= 1 || height <= 1) return;
      palette = createPalette();
      syncCount();
      particles = particles.map(() => spawnParticle(false));
    }

    function onMouseMove(event) {
      pointer.targetXNorm = clamp(event.clientX / Math.max(1, width), 0, 1);
      pointer.active = true;
    }

    function onTouchMove(event) {
      const touch = event.touches[0];
      if (!touch) return;
      pointer.targetXNorm = clamp(touch.clientX / Math.max(1, width), 0, 1);
      pointer.active = true;
    }

    function onLeave() {
      pointer.active = false;
      pointer.targetXNorm = 0.5;
    }

    function animate(now) {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      time += dt;
      const nextSignature = Math.round(width) + 'x' + Math.round(height);
      if (nextSignature !== sizeSignature) {
        rebuild();
      }
      if (width <= 1 || height <= 1) {
        requestAnimationFrame(animate);
        return;
      }
      syncCount();

      pointer.xNorm += (pointer.targetXNorm - pointer.xNorm) * (pointer.active ? 0.14 : 0.06);
      const mousePush = (pointer.xNorm - 0.5) * clamp(config.mouseInfluence, 0, 4);
      const drift = clamp(config.horizontalDrift, 0, 5);
      const frameScale = dt * 60;

      ctx.fillStyle = config.backgroundColor;
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const wind = Math.sin(time * 0.65 + p.seed) * drift * 0.03;
        const attraction = ((pointer.xNorm * width - p.x) / Math.max(1, width)) * clamp(config.mouseInfluence, 0, 4) * 2.1;
        const targetVx = randomBetween(-drift, drift) * 0.2 + mousePush * 1.15 + attraction;
        p.vx += (targetVx - p.vx) * 0.025 * frameScale;
        p.vx += wind * frameScale;

        p.x += p.vx * frameScale;
        p.y += p.vy * frameScale;

        p.opacity += p.dop * frameScale * 0.35;
        if (p.opacity > 1) {
          p.opacity = 1;
          p.dop *= -1;
        }
        if (p.opacity < 0.2) {
          p.opacity = 0.2;
          p.dop = Math.abs(p.dop);
        }

        if (p.y > height + p.r * 2) {
          particles[i] = spawnParticle(true);
          continue;
        }

        if (p.x < -p.r * 2) p.x = width + p.r;
        else if (p.x > width + p.r * 2) p.x = -p.r;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + p.color.r + ',' + p.color.g + ',' + p.color.b + ',' + clamp(p.opacity, 0, 1) + ')';
        ctx.fill();
      }

      requestAnimationFrame(animate);
    }

    rebuild();
    requestAnimationFrame(animate);

    window.addEventListener('resize', rebuild);
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('mouseleave', onLeave);
    window.addEventListener('touchend', onLeave);
  </script>
</body>
</html>
`;
