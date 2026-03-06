import type { StarfieldWarpConfig } from './types';

export const generateCode = (config: StarfieldWarpConfig) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Starfield Warp</title>
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
      if (!/^[0-9a-fA-F]{6}$/.test(full)) return { r: 209, g: 255, b: 255 };
      return {
        r: parseInt(full.slice(0, 2), 16),
        g: parseInt(full.slice(2, 4), 16),
        b: parseInt(full.slice(4, 6), 16)
      };
    }

    function createStar(width, height, depth, minOpacity, maxOpacity) {
      return {
        x: randomBetween(0, width),
        y: randomBetween(0, height),
        z: randomBetween(1, Math.max(2, width * depth)),
        opacity: randomBetween(minOpacity, maxOpacity)
      };
    }

    let width = 0;
    let height = 0;
    let centerX = 0;
    let centerY = 0;
    let sizeSignature = '';
    let lastTime = performance.now();
    let stars = [];

    function rebuild(reset) {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      centerX = width * 0.5;
      centerY = height * 0.5;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      sizeSignature = Math.round(width) + 'x' + Math.round(height);
      if (width <= 1 || height <= 1) return;

      const count = clamp(Math.round(config.starCount), 100, 5000);
      const minOpacity = clamp(config.minOpacity, 0.01, 0.95);
      const maxOpacity = clamp(config.maxOpacity, minOpacity + 0.01, 1);
      const depth = clamp(config.maxDepth, 0.4, 3);

      if (reset) {
        stars = Array.from({ length: count }, () => createStar(width, height, depth, minOpacity, maxOpacity));
      } else {
        while (stars.length < count) stars.push(createStar(width, height, depth, minOpacity, maxOpacity));
        if (stars.length > count) stars.length = count;
      }
    }

    function animate(now) {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      const frameScale = dt * 60;
      lastTime = now;

      const nextSignature = Math.round(width) + 'x' + Math.round(height);
      if (nextSignature !== sizeSignature) rebuild(true);
      if (width <= 1 || height <= 1) {
        requestAnimationFrame(animate);
        return;
      }

      const bg = hexToRgb(config.backgroundColor);
      const fade = config.warpEnabled ? clamp(config.trailFade, 0.01, 1) : 1;
      ctx.fillStyle = 'rgba(' + bg.r + ',' + bg.g + ',' + bg.b + ',' + fade + ')';
      ctx.fillRect(0, 0, width, height);

      const starColor = hexToRgb(config.starColor);
      const baseSpeed = clamp(config.baseSpeed, 0.1, 6);
      const warpSpeed = config.warpEnabled ? clamp(config.warpSpeed, 1, 20) : 1;
      const speed = baseSpeed * warpSpeed;
      const focalLength = width * clamp(config.focalLength, 0.8, 6);
      const depth = clamp(config.maxDepth, 0.4, 3);
      const maxDepthDistance = Math.max(2, width * depth);
      const sizeBase = clamp(config.starSize, 0.2, 3);
      const minOpacity = clamp(config.minOpacity, 0.01, 0.95);
      const maxOpacity = clamp(config.maxOpacity, minOpacity + 0.01, 1);

      for (const star of stars) {
        const previousZ = star.z;
        star.z -= speed * frameScale;
        let wrapped = false;
        if (star.z <= 1) {
          star.x = randomBetween(0, width);
          star.y = randomBetween(0, height);
          star.z = maxDepthDistance;
          star.opacity = randomBetween(minOpacity, maxOpacity);
          wrapped = true;
        }

        const scale = focalLength / star.z;
        const px = (star.x - centerX) * scale + centerX;
        const py = (star.y - centerY) * scale + centerY;
        const radius = sizeBase * scale;

        if (px < -30 || px > width + 30 || py < -30 || py > height + 30) {
          star.x = randomBetween(0, width);
          star.y = randomBetween(0, height);
          star.z = maxDepthDistance;
          star.opacity = randomBetween(minOpacity, maxOpacity);
          continue;
        }

        if (config.warpEnabled && !wrapped) {
          const prevScale = focalLength / Math.max(1, previousZ);
          const prevX = (star.x - centerX) * prevScale + centerX;
          const prevY = (star.y - centerY) * prevScale + centerY;
          const trailAlpha = star.opacity * clamp(0.2 + speed * 0.04, 0.25, 0.75);
          ctx.strokeStyle = 'rgba(' + starColor.r + ',' + starColor.g + ',' + starColor.b + ',' + trailAlpha + ')';
          ctx.lineWidth = Math.max(0.2, radius * 0.48);
          ctx.beginPath();
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(px, py);
          ctx.stroke();
        }

        const coreRadius = Math.max(0.22, radius * 0.72);
        if (coreRadius > 0.65) {
          const glowRadius = coreRadius * 1.55;
          ctx.fillStyle = 'rgba(' + starColor.r + ',' + starColor.g + ',' + starColor.b + ',' + (star.opacity * 0.14) + ')';
          ctx.beginPath();
          ctx.arc(px, py, glowRadius, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = 'rgba(' + starColor.r + ',' + starColor.g + ',' + starColor.b + ',' + star.opacity + ')';
        ctx.beginPath();
        ctx.arc(px, py, coreRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(animate);
    }

    rebuild(true);
    requestAnimationFrame(animate);
    window.addEventListener('resize', () => rebuild(true));
  </script>
</body>
</html>
`;
