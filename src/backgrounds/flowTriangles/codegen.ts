import type { FlowTrianglesConfig } from './types';

export const generateCode = (config: FlowTrianglesConfig) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Flow Triangles</title>
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
    const fract = (value) => value - Math.floor(value);
    const smoothstep = (t) => t * t * (3 - 2 * t);
    const lerp = (a, b, t) => a + (b - a) * t;
    const hash2 = (x, y) => fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453123);
    const valueNoise2 = (x, y) => {
      const x0 = Math.floor(x), y0 = Math.floor(y);
      const x1 = x0 + 1, y1 = y0 + 1;
      const sx = smoothstep(x - x0), sy = smoothstep(y - y0);
      const n00 = hash2(x0, y0), n10 = hash2(x1, y0), n01 = hash2(x0, y1), n11 = hash2(x1, y1);
      const nx0 = lerp(n00, n10, sx), nx1 = lerp(n01, n11, sx);
      return lerp(nx0, nx1, sy);
    };

    let width = 0, height = 0, cols = 0, rows = 0, sizeSignature = '';
    let forces = [];
    let particles = [];
    let cursor = 0;
    const mouse = { x: 0, y: 0 };
    const emitter = { x: 0, y: 0 };

    function resetVec(v, x, y) {
      v.x = x; v.y = y;
    }
    function createTrianglePoints(spread) {
      return [
        { x: -spread + Math.random() * spread * 2, y: -spread + Math.random() * spread * 2 },
        { x: -spread + Math.random() * spread * 2, y: -spread + Math.random() * spread * 2 },
        { x: -spread + Math.random() * spread * 2, y: -spread + Math.random() * spread * 2 }
      ];
    }
    function createParticle(spread) {
      return {
        position: { x: -100, y: -100 },
        velocity: { x: 0, y: 0.1 },
        acceleration: { x: 0, y: 0 },
        alpha: 0,
        color: '#000',
        points: createTrianglePoints(spread)
      };
    }

    function updateSize() {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cols = Math.max(1, Math.ceil(width / clamp(config.cellSize, 8, 64)));
      rows = Math.max(1, Math.ceil(height / clamp(config.cellSize, 8, 64)));
      sizeSignature = Math.round(width) + 'x' + Math.round(height);
    }

    function initForces() {
      const total = cols * rows;
      while (forces.length < total) forces.push({ x: 0, y: 0 });
      if (forces.length > total) forces.length = total;
    }

    function initParticles(resetPool) {
      const count = clamp(Math.round(config.particleCount), 50, 2500);
      const spread = clamp(config.triangleSpread, 2, 40);
      if (resetPool) {
        particles = Array.from({ length: count }, () => createParticle(spread));
        cursor = 0;
        return;
      }
      while (particles.length < count) particles.push(createParticle(spread));
      if (particles.length > count) particles.length = count;
      for (const p of particles) p.points = createTrianglePoints(spread);
      cursor = cursor % Math.max(1, particles.length);
    }

    function updateForces(timeMs) {
      const noiseScale = clamp(config.noiseScale, 0.01, 0.5);
      const timeScale = clamp(config.timeScale, 0.05, 3);
      const force = clamp(config.forceStrength, 0.01, 1);
      const time = timeMs * 0.0004 * timeScale;
      let i = 0;
      for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
          const n = valueNoise2(x * noiseScale + time, y * noiseScale - time * 0.8);
          const angle = n * Math.PI * 8;
          forces[i].x = Math.cos(angle) * force;
          forces[i].y = Math.sin(angle) * force;
          i++;
        }
      }
    }

    function followForce(particle) {
      const cell = clamp(config.cellSize, 8, 64);
      const cx = Math.floor(particle.position.x / cell);
      const cy = Math.floor(particle.position.y / cell);
      if (cx < 0 || cx >= cols || cy < 0 || cy >= rows) return;
      const f = forces[cx * rows + cy];
      if (!f) return;
      particle.acceleration.x += f.x;
      particle.acceleration.y += f.y;
    }

    function launchParticle() {
      if (!particles.length) return;
      const p = particles[cursor];
      resetVec(p.position, emitter.x, emitter.y);
      resetVec(p.velocity, -1 + Math.random() * 2, -1 + Math.random() * 2);
      p.alpha = 1;
      const hue = Math.floor((emitter.x / Math.max(1, width)) * 256);
      const sat = clamp(config.hueSaturation, 0, 100);
      const lMin = clamp(config.lightnessMin, 10, 90);
      const lMax = clamp(config.lightnessMax, lMin + 1, 100);
      p.color = 'hsl(' + hue + ',' + sat + '%,' + randomBetween(lMin, lMax) + '%)';
      cursor++;
      if (cursor >= particles.length) cursor = 0;
    }

    function rebuild(hard) {
      updateSize();
      initForces();
      initParticles(hard);
      mouse.x = width * 0.5; mouse.y = height * 0.5;
      emitter.x = width * 0.5; emitter.y = height * 0.5;
    }

    function pointer(x, y) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = x - rect.left;
      mouse.y = y - rect.top;
    }

    function animate(t) {
      const nextSignature = Math.round(width) + 'x' + Math.round(height);
      if (nextSignature !== sizeSignature) rebuild(true);
      if (width <= 1 || height <= 1) {
        requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = config.backgroundColor;
      ctx.fillRect(0, 0, width, height);

      const lerpFactor = clamp(config.emitterLerp, 0.01, 0.8);
      emitter.x += (mouse.x - emitter.x) * lerpFactor;
      emitter.y += (mouse.y - emitter.y) * lerpFactor;

      const spawnCount = clamp(Math.round(config.spawnPerFrame), 1, 30);
      for (let i = 0; i < spawnCount; i++) launchParticle();
      updateForces(t);

      const drag = clamp(config.particleDrag, 0.8, 1);
      const decay = clamp(config.alphaDecay, 0.001, 0.05);
      for (const p of particles) {
        p.velocity.x += p.acceleration.x;
        p.velocity.y += p.acceleration.y;
        p.velocity.x *= drag;
        p.velocity.y *= drag;
        p.position.x += p.velocity.x;
        p.position.y += p.velocity.y;
        resetVec(p.acceleration, 0, 0);
        p.alpha = Math.max(0, p.alpha - decay);
        followForce(p);
        if (p.alpha <= 0) continue;

        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.moveTo(p.position.x + p.points[0].x, p.position.y + p.points[0].y);
        ctx.lineTo(p.position.x + p.points[1].x, p.position.y + p.points[1].y);
        ctx.lineTo(p.position.x + p.points[2].x, p.position.y + p.points[2].y);
        ctx.closePath();
        ctx.fillStyle = p.color;
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      requestAnimationFrame(animate);
    }

    rebuild(true);
    requestAnimationFrame(animate);
    window.addEventListener('resize', () => rebuild(true));
    window.addEventListener('mousemove', (e) => pointer(e.clientX, e.clientY), { passive: true });
    window.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      if (!touch) return;
      pointer(touch.clientX, touch.clientY);
    }, { passive: true });
  </script>
</body>
</html>
`;
