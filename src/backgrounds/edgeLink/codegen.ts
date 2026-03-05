import type { EdgeLinkConfig } from './types';

export const generateCode = (config: EdgeLinkConfig) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Edge Link Dots</title>
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
    const SIDES = ['top', 'right', 'bottom', 'left'];
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const randomBetween = (min, max) => min + Math.random() * (max - min);

    function hexToRgb(hex) {
      const normalized = hex.trim().replace('#', '');
      const full = normalized.length === 3
        ? normalized.split('').map((char) => char + char).join('')
        : normalized;
      if (!/^[0-9a-fA-F]{6}$/.test(full)) return { r: 156, g: 156, b: 156 };
      return {
        r: parseInt(full.slice(0, 2), 16),
        g: parseInt(full.slice(2, 4), 16),
        b: parseInt(full.slice(4, 6), 16)
      };
    }

    function randomSide() {
      return SIDES[Math.floor(Math.random() * SIDES.length)];
    }

    function randomSpeed(side, minSpeed, maxSpeed) {
      const min = Math.max(0.01, minSpeed);
      const max = Math.max(min + 0.01, maxSpeed);
      const rand = () => randomBetween(min, max);

      switch (side) {
        case 'top':
          return [randomBetween(-max, max), rand()];
        case 'right':
          return [-rand(), randomBetween(-max, max)];
        case 'bottom':
          return [randomBetween(-max, max), -rand()];
        case 'left':
        default:
          return [rand(), randomBetween(-max, max)];
      }
    }

    function createDotFromSide(width, height) {
      const side = randomSide();
      const pad = clamp(config.spawnPadding, 0, 24);
      const speed = randomSpeed(side, config.speedMin, config.speedMax);

      switch (side) {
        case 'top':
          return { x: randomBetween(0, width), y: -pad, vx: speed[0], vy: speed[1], alpha: 1, phase: randomBetween(0, 10) };
        case 'right':
          return { x: width + pad, y: randomBetween(0, height), vx: speed[0], vy: speed[1], alpha: 1, phase: randomBetween(0, 10) };
        case 'bottom':
          return { x: randomBetween(0, width), y: height + pad, vx: speed[0], vy: speed[1], alpha: 1, phase: randomBetween(0, 10) };
        case 'left':
        default:
          return { x: -pad, y: randomBetween(0, height), vx: speed[0], vy: speed[1], alpha: 1, phase: randomBetween(0, 10) };
      }
    }

    function createDotInViewport(width, height) {
      const side = randomSide();
      const speed = randomSpeed(side, config.speedMin, config.speedMax);
      return {
        x: randomBetween(0, width),
        y: randomBetween(0, height),
        vx: speed[0],
        vy: speed[1],
        alpha: 1,
        phase: randomBetween(0, 10)
      };
    }

    let width = 0;
    let height = 0;
    let sizeSignature = '';
    let dots = [];
    const mouseDot = { x: 0, y: 0, vx: 0, vy: 0, alpha: 1, phase: 0, type: 'mouse' };
    let mouseIn = false;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeSignature = Math.round(width) + 'x' + Math.round(height);
      dots = [];
      syncDotCount(true);
    }

    function isInsideBounds(dot) {
      const bound = clamp(config.boundsPadding, 10, 180);
      return dot.x > -bound && dot.x < width + bound && dot.y > -bound && dot.y < height + bound;
    }

    function syncDotCount(preferViewportSpawn) {
      const count = clamp(Math.round(config.ballCount), 8, 180);
      dots = dots.filter((dot) => dot.type !== 'mouse');
      while (dots.length < count) {
        dots.push(preferViewportSpawn ? createDotInViewport(width, height) : createDotFromSide(width, height));
      }
      if (dots.length > count) dots.length = count;
      if (config.enableMouseNode && mouseIn) dots.push(mouseDot);
    }

    function onMouseEnter() {
      mouseIn = true;
      syncDotCount(false);
    }

    function onMouseLeave() {
      mouseIn = false;
      dots = dots.filter((dot) => dot.type !== 'mouse');
    }

    function onMouseMove(event) {
      const rect = canvas.getBoundingClientRect();
      mouseDot.x = event.clientX - rect.left;
      mouseDot.y = event.clientY - rect.top;
    }

    function onTouchMove(event) {
      const touch = event.touches[0];
      if (!touch) return;
      const rect = canvas.getBoundingClientRect();
      mouseDot.x = touch.clientX - rect.left;
      mouseDot.y = touch.clientY - rect.top;
      if (!mouseIn) {
        mouseIn = true;
        syncDotCount();
      }
    }

    function onTouchEnd() {
      mouseIn = false;
      dots = dots.filter((dot) => dot.type !== 'mouse');
    }

    function animate() {
      const nextSignature = Math.round(width) + 'x' + Math.round(height);
      if (nextSignature !== sizeSignature) resize();
      if (width <= 1 || height <= 1) {
        requestAnimationFrame(animate);
        return;
      }

      const node = hexToRgb(config.nodeColor);
      const line = hexToRgb(config.lineColor);
      const radius = clamp(config.ballRadius, 0.5, 8);
      const pulseSpeed = clamp(config.pulseSpeed, 0.005, 0.12);
      const distanceLimit = clamp(config.distanceLimit, 40, 520);
      const distanceLimitSq = distanceLimit * distanceLimit;

      ctx.fillStyle = config.backgroundColor;
      ctx.fillRect(0, 0, width, height);

      const nextDots = [];
      for (const dot of dots) {
        if (dot.type !== 'mouse') {
          dot.x += dot.vx;
          dot.y += dot.vy;
          dot.phase += pulseSpeed;
          dot.alpha = Math.abs(Math.cos(dot.phase));
        }

        if (dot.type === 'mouse' || isInsideBounds(dot)) {
          nextDots.push(dot);
        }
      }
      dots = nextDots;
      syncDotCount();

      ctx.lineWidth = clamp(config.lineWidth, 0.2, 3);
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const a = dots[i];
          const b = dots[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < distanceLimitSq) {
            const alpha = 1 - Math.sqrt(distSq) / distanceLimit;
            ctx.strokeStyle = 'rgba(' + line.r + ',' + line.g + ',' + line.b + ',' + alpha + ')';
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (const dot of dots) {
        if (dot.type === 'mouse') continue;
        ctx.fillStyle = 'rgba(' + node.r + ',' + node.g + ',' + node.b + ',' + dot.alpha + ')';
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, radius, 0, TAU);
        ctx.fill();
      }

      requestAnimationFrame(animate);
    }

    resize();
    requestAnimationFrame(animate);
    window.addEventListener('resize', resize);
    canvas.addEventListener('mouseenter', onMouseEnter);
    canvas.addEventListener('mouseleave', onMouseLeave);
    canvas.addEventListener('mousemove', onMouseMove, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: true });
    canvas.addEventListener('touchend', onTouchEnd);
  </script>
</body>
</html>
`;
