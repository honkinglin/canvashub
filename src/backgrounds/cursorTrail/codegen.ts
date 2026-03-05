import type { CursorTrailConfig } from './types';
export const generateCode = (config: CursorTrailConfig) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cursor Trail</title>
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

    let width = 0;
    let height = 0;
    let sizeSignature = '';
    const mouse = { x: -1e6, y: -1e6, active: false };
    let particles = [];

    function clamp(value, min, max) {
      return Math.min(max, Math.max(min, value));
    }

    function hexToRgb(hex) {
      const value = hex.replace('#', '');
      return {
        r: parseInt(value.slice(0, 2), 16),
        g: parseInt(value.slice(2, 4), 16),
        b: parseInt(value.slice(4, 6), 16)
      };
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
    }

    function spawnParticle() {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        alpha: Math.random() * 0.4 + 0.2
      };
    }

    function resetParticle(p) {
      p.x = Math.random() * width;
      p.y = Math.random() * height;
      p.vx = (Math.random() - 0.5) * 0.5;
      p.vy = (Math.random() - 0.5) * 0.5;
      p.alpha = Math.random() * 0.4 + 0.2;
    }

    function syncParticleCount() {
      if (width <= 1 || height <= 1) return;
      const count = clamp(Math.round(config.particleCount), 100, 5000);
      while (particles.length < count) particles.push(spawnParticle());
      if (particles.length > count) particles.length = count;
    }

    function onMouseMove(event) {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
      mouse.active = true;
    }

    function onTouchMove(event) {
      const touch = event.touches[0];
      if (!touch) return;
      mouse.x = touch.clientX;
      mouse.y = touch.clientY;
      mouse.active = true;
    }

    function onLeave() {
      mouse.active = false;
    }

    function draw() {
      const nextSignature = Math.round(width) + 'x' + Math.round(height);
      if (nextSignature !== sizeSignature) {
        sizeSignature = nextSignature;
        particles = [];
        syncParticleCount();
      }
      if (width <= 1 || height <= 1) {
        requestAnimationFrame(draw);
        return;
      }

      const rgbParticle = hexToRgb(config.particleColor);
      const rgbBg = hexToRgb(config.backgroundColor);

      ctx.fillStyle = 'rgba(' + rgbBg.r + ',' + rgbBg.g + ',' + rgbBg.b + ',' + clamp(config.trailAlpha, 0.01, 1) + ')';
      ctx.fillRect(0, 0, width, height);

      const maxVelocity = clamp(config.maxVelocity, 0.05, 12);
      const maxVelocitySq = maxVelocity * maxVelocity;
      const mouseRadius = clamp(config.mouseRadius, 10, 1000);
      const mouseRadiusSq = mouseRadius * mouseRadius;
      const jitter = clamp(config.jitter, 0, 0.3);
      const pointSize = clamp(config.pointSize, 0.2, 4);
      const forceBase = 0.02 * clamp(config.mouseStrength, 0, 2.5);

      syncParticleCount();

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.vx += (Math.random() - 0.5) * jitter;
        p.vy += (Math.random() - 0.5) * jitter;

        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < mouseRadiusSq) {
            const dist = Math.sqrt(distSq) || 1;
            const force = (mouseRadius - dist) / mouseRadius;
            p.vx += dx * force * forceBase;
            p.vy += dy * force * forceBase;
          }
        }

        const speedSq = p.vx * p.vx + p.vy * p.vy;
        if (speedSq > maxVelocitySq) {
          const speed = Math.sqrt(speedSq);
          const ratio = maxVelocity / speed;
          p.vx *= ratio;
          p.vy *= ratio;
        }

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -10 || p.x > width + 10 || p.y < -10 || p.y > height + 10) {
          resetParticle(p);
        }

        ctx.fillStyle = 'rgba(' + rgbParticle.r + ',' + rgbParticle.g + ',' + rgbParticle.b + ',' + p.alpha + ')';
        ctx.beginPath();
        ctx.arc(p.x, p.y, pointSize, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(draw);
    }

    resize();
    sizeSignature = Math.round(width) + 'x' + Math.round(height);
    syncParticleCount();
    draw();

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('mouseleave', onLeave);
    window.addEventListener('touchend', onLeave);
  </script>
</body>
</html>
`;
