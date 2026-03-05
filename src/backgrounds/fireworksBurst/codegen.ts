import type { FireworksBurstConfig } from './types';

export const generateCode = (config: FireworksBurstConfig) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Fireworks Burst</title>
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
    const easeOutExpo = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

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

    function makePalette() {
      return [config.colorA, config.colorB, config.colorC, config.colorD].map(hexToRgb);
    }

    let palette = makePalette();
    let width = 0;
    let height = 0;
    let sizeSignature = '';
    let interacted = false;
    let lastAutoBurst = performance.now();
    const bursts = [];

    function updateSize() {
      const dpr = window.devicePixelRatio || 1;
      width = canvas.width / dpr;
      height = canvas.height / dpr;
    }

    function createBurst(x, y, now) {
      const particleCount = clamp(Math.round(config.particleCount), 8, 120);
      const radiusMin = clamp(config.particleRadiusMin, 1, 60);
      const radiusMax = clamp(config.particleRadiusMax, radiusMin + 0.1, 80);
      const spreadMin = clamp(config.spreadMin, 10, 320);
      const spreadMax = clamp(config.spreadMax, spreadMin + 1, 420);
      const durationMin = clamp(config.durationMin, 200, 4000);
      const durationMax = clamp(config.durationMax, durationMin + 10, 5000);
      const ringRadiusMin = clamp(config.ringRadiusMin, 20, 320);
      const ringRadiusMax = clamp(config.ringRadiusMax, ringRadiusMin + 1, 420);

      const particles = [];
      for (let i = 0; i < particleCount; i++) {
        const angle = randomBetween(0, TAU);
        const spread = randomBetween(spreadMin, spreadMax);
        particles.push({
          startX: x,
          startY: y,
          endX: x + Math.cos(angle) * spread,
          endY: y + Math.sin(angle) * spread,
          startRadius: randomBetween(radiusMin, radiusMax),
          color: palette[Math.floor(Math.random() * palette.length)]
        });
      }

      bursts.push({
        x,
        y,
        startTime: now,
        duration: randomBetween(durationMin, durationMax),
        particles,
        ring: {
          maxRadius: randomBetween(ringRadiusMin, ringRadiusMax),
          startLineWidth: clamp(config.ringLineWidth, 0.1, 24),
          startAlpha: 0.5
        }
      });
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
      bursts.length = 0;
      createBurst(width * 0.5, height * 0.5, performance.now());
    }

    function onMouseDown(event) {
      interacted = true;
      const rect = canvas.getBoundingClientRect();
      createBurst(event.clientX - rect.left, event.clientY - rect.top, performance.now());
    }

    function onTouchStart(event) {
      const touch = event.touches[0];
      if (!touch) return;
      interacted = true;
      const rect = canvas.getBoundingClientRect();
      createBurst(touch.clientX - rect.left, touch.clientY - rect.top, performance.now());
    }

    function animate(now) {
      updateSize();
      const nextSignature = Math.round(width) + 'x' + Math.round(height);
      if (nextSignature !== sizeSignature) resize();
      if (width <= 1 || height <= 1) {
        requestAnimationFrame(animate);
        return;
      }

      const bg = hexToRgb(config.backgroundColor);
      ctx.fillStyle = 'rgba(' + bg.r + ',' + bg.g + ',' + bg.b + ',' + clamp(config.fadeAlpha, 0.02, 1) + ')';
      ctx.fillRect(0, 0, width, height);

      if (config.autoBurst && (!config.stopAutoOnInteract || !interacted)) {
        const interval = clamp(config.autoBurstInterval, 80, 2000);
        if (now - lastAutoBurst >= interval) {
          lastAutoBurst = now;
          const jitter = clamp(config.autoBurstJitter, 0, 300);
          createBurst(
            width * 0.5 + randomBetween(-jitter, jitter),
            height * 0.5 + randomBetween(-jitter, jitter),
            now
          );
        }
      }

      for (let i = bursts.length - 1; i >= 0; i--) {
        const burst = bursts[i];
        const raw = (now - burst.startTime) / Math.max(1, burst.duration);
        const t = clamp(raw, 0, 1);
        const eased = easeOutExpo(t);

        for (const particle of burst.particles) {
          const x = particle.startX + (particle.endX - particle.startX) * eased;
          const y = particle.startY + (particle.endY - particle.startY) * eased;
          const r = Math.max(0.1, particle.startRadius * (1 - t));

          ctx.beginPath();
          ctx.arc(x, y, r, 0, TAU);
          ctx.fillStyle = 'rgb(' + particle.color.r + ',' + particle.color.g + ',' + particle.color.b + ')';
          ctx.fill();
        }

        const ringRadius = burst.ring.maxRadius * eased;
        const ringLineWidth = burst.ring.startLineWidth * (1 - t);
        const ringAlpha = burst.ring.startAlpha * (1 - t);
        if (ringLineWidth > 0.05 && ringAlpha > 0.01) {
          ctx.globalAlpha = ringAlpha;
          ctx.beginPath();
          ctx.arc(burst.x, burst.y, ringRadius, 0, TAU);
          ctx.lineWidth = ringLineWidth;
          ctx.strokeStyle = '#ffffff';
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        if (t >= 1) bursts.splice(i, 1);
      }

      requestAnimationFrame(animate);
    }

    resize();
    requestAnimationFrame(animate);
    window.addEventListener('resize', resize);
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
  </script>
</body>
</html>
`;
