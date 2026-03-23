import type { BubbleBounceConfig } from './types';

export const generateCode = (config: BubbleBounceConfig) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bubble Bounce</title>
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

    const circles = [];
    let width = 0;
    let height = 0;
    let lastTime = performance.now();

    function palette() {
      return [config.colorA, config.colorB, config.colorC, config.colorD, config.colorE];
    }

    function randomColor() {
      const colors = palette();
      return colors[Math.floor(Math.random() * colors.length)] || '#2885FF';
    }

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

    function resetCircle(circle, randomPosition) {
      const minR = clamp(config.radiusMin, 2, 240);
      const maxR = clamp(config.radiusMax, minR + 1, 260);
      const speed = clamp(config.speed, 0.01, 30);

      const radius = randomBetween(minR, maxR);
      const direction = randomBetween(0, Math.PI * 2);
      const velocity = randomBetween(0.35, 1.0) * speed;

      circle.radius = radius;
      circle.vx = Math.cos(direction) * velocity;
      circle.vy = Math.sin(direction) * velocity;
      circle.color = randomColor();

      if (randomPosition) {
        circle.x = randomBetween(radius, Math.max(radius, width - radius));
        circle.y = randomBetween(radius, Math.max(radius, height - radius));
      } else {
        circle.x = clamp(circle.x, radius, Math.max(radius, width - radius));
        circle.y = clamp(circle.y, radius, Math.max(radius, height - radius));
      }
    }

    function initCircles() {
      circles.length = 0;
      const count = clamp(Math.round(config.circleCount), 1, 600);
      for (let i = 0; i < count; i++) {
        const circle = { x: 0, y: 0, vx: 0, vy: 0, radius: 8, color: '#2885FF' };
        resetCircle(circle, true);
        circles.push(circle);
      }
    }

    function animate(now) {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      const frameScale = dt * 60;
      lastTime = now;

      const strokeWidth = clamp(config.strokeWidth, 0.1, 20);
      const trailAlpha = clamp(config.trailAlpha, 0.02, 1);
      const bounceLoss = clamp(config.bounceLoss, 0.5, 1);

      ctx.fillStyle = config.backgroundColor;
      if (trailAlpha >= 0.999) {
        ctx.globalAlpha = 1;
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.globalAlpha = trailAlpha;
        ctx.fillRect(0, 0, width, height);
        ctx.globalAlpha = 1;
      }

      ctx.lineWidth = strokeWidth;

      for (let i = 0; i < circles.length; i++) {
        const circle = circles[i];

        circle.x += circle.vx * frameScale;
        circle.y += circle.vy * frameScale;

        if (circle.x + circle.radius >= width) {
          circle.x = width - circle.radius;
          circle.vx = -Math.abs(circle.vx) * bounceLoss;
        } else if (circle.x - circle.radius <= 0) {
          circle.x = circle.radius;
          circle.vx = Math.abs(circle.vx) * bounceLoss;
        }

        if (circle.y + circle.radius >= height) {
          circle.y = height - circle.radius;
          circle.vy = -Math.abs(circle.vy) * bounceLoss;
        } else if (circle.y - circle.radius <= 0) {
          circle.y = circle.radius;
          circle.vy = Math.abs(circle.vy) * bounceLoss;
        }

        if (Math.abs(circle.vx) < 0.04) circle.vx = circle.vx < 0 ? -0.04 : 0.04;
        if (Math.abs(circle.vy) < 0.04) circle.vy = circle.vy < 0 ? -0.04 : 0.04;

        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
        ctx.strokeStyle = circle.color;
        ctx.stroke();
      }

      requestAnimationFrame(animate);
    }

    function handleResize() {
      updateSize();
      initCircles();
    }

    window.addEventListener('resize', handleResize);
    handleResize();
    requestAnimationFrame(animate);
  </script>
</body>
</html>
`;
