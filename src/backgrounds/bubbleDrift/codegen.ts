import type { BubbleDriftConfig } from './types';

export const generateCode = (config: BubbleDriftConfig) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bubble Drift</title>
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
    let animationId = 0;
    let lastTime = performance.now();

    const bubbles = [];
    const spriteCache = new Map();
    const coreRgb = hexToRgb(config.colorCore, { r: 255, g: 255, b: 255 });
    const midRgb = hexToRgb(config.colorMid, { r: 173, g: 216, b: 230 });
    const edgeRgb = hexToRgb(config.colorEdge, { r: 0, g: 100, b: 160 });

    const mouse = { x: 0, y: 0, active: false };

    function updateSize() {
      const dpr = window.devicePixelRatio || 1;
      width = Math.max(1, window.innerWidth);
      height = Math.max(1, window.innerHeight);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spriteKey(radius, opacity) {
      return [
        Math.round(radius * 4),
        Math.round(opacity * 100),
        config.colorCore,
        config.colorMid,
        config.colorEdge,
        Math.round(config.outlineAlpha * 100)
      ].join('_');
    }

    function getSprite(radius, opacity) {
      const key = spriteKey(radius, opacity);
      const cached = spriteCache.get(key);
      if (cached) return cached;

      const pad = 2;
      const size = Math.ceil(radius * 2 + pad * 2);
      const off = document.createElement('canvas');
      off.width = size;
      off.height = size;
      const octx = off.getContext('2d');
      if (!octx) return off;

      const cx = size * 0.5;
      const cy = size * 0.5;
      const gradient = octx.createRadialGradient(
        cx - radius / 3,
        cy - radius / 3,
        radius * 0.1,
        cx,
        cy,
        radius
      );
      gradient.addColorStop(0, \`rgba(\${coreRgb.r}, \${coreRgb.g}, \${coreRgb.b}, \${opacity})\`);
      gradient.addColorStop(0.5, \`rgba(\${midRgb.r}, \${midRgb.g}, \${midRgb.b}, \${opacity})\`);
      gradient.addColorStop(1, \`rgba(\${edgeRgb.r}, \${edgeRgb.g}, \${edgeRgb.b}, \${opacity * 0.5})\`);

      octx.beginPath();
      octx.arc(cx, cy, radius, 0, Math.PI * 2);
      octx.fillStyle = gradient;
      octx.fill();

      const outlineAlpha = clamp(config.outlineAlpha, 0, 1) * opacity;
      if (outlineAlpha > 0) {
        octx.strokeStyle = \`rgba(\${coreRgb.r}, \${coreRgb.g}, \${coreRgb.b}, \${outlineAlpha})\`;
        octx.lineWidth = 0.5;
        octx.stroke();
      }

      spriteCache.set(key, off);
      return off;
    }

    function resetBubble(bubble, spawnAtBottom) {
      const radiusMin = clamp(config.radiusMin, 1, 200);
      const radiusMax = clamp(config.radiusMax, radiusMin + 1, 240);
      const speedMin = clamp(config.speedMin, 0.01, 20);
      const speedMax = clamp(config.speedMax, speedMin + 0.01, 25);
      const opacityMin = clamp(config.opacityMin, 0.01, 1);
      const opacityMax = clamp(config.opacityMax, opacityMin, 1);

      bubble.radius = randomBetween(radiusMin, radiusMax);
      bubble.speed = randomBetween(speedMin, speedMax);
      bubble.opacity = randomBetween(opacityMin, opacityMax);
      bubble.x = randomBetween(0, width);
      bubble.y = spawnAtBottom ? height + randomBetween(0, height) : randomBetween(0, height);
      bubble.driftPhase = randomBetween(0, Math.PI * 2);
      bubble.driftSpeed = randomBetween(0.4, 1.5);
    }

    function syncCount(resetAll) {
      const target = clamp(Math.round(config.bubbleCount), 1, 800);
      while (bubbles.length < target) {
        const bubble = {
          x: 0,
          y: 0,
          radius: 12,
          speed: 1,
          opacity: 0.4,
          driftPhase: 0,
          driftSpeed: 1
        };
        resetBubble(bubble, true);
        bubbles.push(bubble);
      }
      if (bubbles.length > target) {
        bubbles.length = target;
      }
      if (resetAll) {
        for (let i = 0; i < bubbles.length; i++) {
          resetBubble(bubbles[i], false);
        }
      }
    }

    function updatePointer(clientX, clientY) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = clientX - rect.left;
      mouse.y = clientY - rect.top;
      mouse.active = true;
    }

    function animate(now) {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      const frameScale = dt * 60;
      lastTime = now;

      ctx.fillStyle = config.backgroundColor;
      ctx.fillRect(0, 0, width, height);

      const repelRadius = clamp(config.repelRadius, 1, 1200);
      const repelStrength = clamp(config.repelStrength, 0, 80);
      const drift = clamp(config.drift, 0, 20);

      for (let i = 0; i < bubbles.length; i++) {
        const bubble = bubbles[i];
        bubble.y -= bubble.speed * frameScale;
        bubble.x += Math.sin(now * 0.001 * bubble.driftSpeed + bubble.driftPhase) * drift * 0.03 * frameScale;

        if (mouse.active) {
          const dx = bubble.x - mouse.x;
          const dy = bubble.y - mouse.y;
          const range = repelRadius + bubble.radius;
          const distSq = dx * dx + dy * dy;
          if (distSq < range * range) {
            const dist = Math.sqrt(distSq) || 0.0001;
            const force = (range - dist) / Math.max(1, repelRadius);
            const push = force * repelStrength * frameScale;
            bubble.x += (dx / dist) * push;
            bubble.y += (dy / dist) * push;
          }
        }

        if (bubble.y + bubble.radius < 0 || bubble.x < -bubble.radius * 3 || bubble.x > width + bubble.radius * 3) {
          resetBubble(bubble, true);
        }

        const sprite = getSprite(bubble.radius, bubble.opacity);
        const half = sprite.width * 0.5;
        ctx.drawImage(sprite, bubble.x - half, bubble.y - half);
      }

      animationId = requestAnimationFrame(animate);
    }

    function start() {
      updateSize();
      syncCount(true);
      cancelAnimationFrame(animationId);
      animationId = requestAnimationFrame(animate);
    }

    canvas.addEventListener('mousemove', (e) => updatePointer(e.clientX, e.clientY), { passive: true });
    canvas.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      if (!touch) return;
      updatePointer(touch.clientX, touch.clientY);
    }, { passive: true });
    canvas.addEventListener('mouseleave', () => { mouse.active = false; });
    canvas.addEventListener('touchend', () => { mouse.active = false; });
    canvas.addEventListener('touchcancel', () => { mouse.active = false; });
    window.addEventListener('resize', start);

    start();
  </script>
</body>
</html>
`;
