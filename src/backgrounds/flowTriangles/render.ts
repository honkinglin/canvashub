import type { CanvasRenderFunction } from '../../types';
import type { FlowTrianglesConfig } from './types';

interface Vec2 {
  x: number;
  y: number;
}

interface Particle {
  position: Vec2;
  velocity: Vec2;
  acceleration: Vec2;
  alpha: number;
  color: string;
  points: [Vec2, Vec2, Vec2];
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

const fract = (value: number) => value - Math.floor(value);
const smoothstep = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const hash2 = (x: number, y: number) => fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453123);

const valueNoise2 = (x: number, y: number) => {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = x0 + 1;
  const y1 = y0 + 1;

  const sx = smoothstep(x - x0);
  const sy = smoothstep(y - y0);

  const n00 = hash2(x0, y0);
  const n10 = hash2(x1, y0);
  const n01 = hash2(x0, y1);
  const n11 = hash2(x1, y1);

  const nx0 = lerp(n00, n10, sx);
  const nx1 = lerp(n01, n11, sx);
  return lerp(nx0, nx1, sy);
};

const createTrianglePoints = (spread: number): [Vec2, Vec2, Vec2] => [
  { x: -spread + Math.random() * spread * 2, y: -spread + Math.random() * spread * 2 },
  { x: -spread + Math.random() * spread * 2, y: -spread + Math.random() * spread * 2 },
  { x: -spread + Math.random() * spread * 2, y: -spread + Math.random() * spread * 2 },
];

const createParticle = (spread: number): Particle => ({
  position: { x: -100, y: -100 },
  velocity: { x: 0, y: 0.1 },
  acceleration: { x: 0, y: 0 },
  alpha: 0,
  color: '#000000',
  points: createTrianglePoints(spread),
});

const resetVec = (v: Vec2, x: number, y: number) => {
  v.x = x;
  v.y = y;
};

export const render: CanvasRenderFunction<FlowTrianglesConfig> = (canvas, ctx, initialConfig) => {
  let config = { ...initialConfig };
  let animationId = 0;
  let width = 0;
  let height = 0;
  let sizeSignature = '';

  let cols = 0;
  let rows = 0;
  const forces: Vec2[] = [];
  let particles: Particle[] = [];
  let cursor = 0;

  const mouse: Vec2 = { x: 0, y: 0 };
  const emitter: Vec2 = { x: 0, y: 0 };

  const updateSize = () => {
    const dpr = window.devicePixelRatio || 1;
    width = canvas.width / dpr;
    height = canvas.height / dpr;
    cols = Math.max(1, Math.ceil(width / clamp(config.cellSize, 8, 64)));
    rows = Math.max(1, Math.ceil(height / clamp(config.cellSize, 8, 64)));
  };

  const initForces = () => {
    const total = cols * rows;
    while (forces.length < total) {
      forces.push({ x: 0, y: 0 });
    }
    if (forces.length > total) {
      forces.length = total;
    }
  };

  const initParticles = (resetPool = true) => {
    const count = clamp(Math.round(config.particleCount), 50, 2500);
    const spread = clamp(config.triangleSpread, 2, 40);
    if (resetPool) {
      particles = Array.from({ length: count }, () => createParticle(spread));
      cursor = 0;
      return;
    }

    while (particles.length < count) {
      particles.push(createParticle(spread));
    }
    if (particles.length > count) {
      particles.length = count;
    }
    for (const p of particles) {
      p.points = createTrianglePoints(spread);
    }
    cursor = cursor % Math.max(1, particles.length);
  };

  const updateForces = (timeMs: number) => {
    const cell = clamp(config.cellSize, 8, 64);
    const noiseScale = clamp(config.noiseScale, 0.01, 0.5);
    const timeScale = clamp(config.timeScale, 0.05, 3);
    const force = clamp(config.forceStrength, 0.01, 1);
    const time = timeMs * 0.0004 * timeScale;

    let i = 0;
    for (let x = 0; x < cols; x += 1) {
      for (let y = 0; y < rows; y += 1) {
        const nx = x * noiseScale + time;
        const ny = y * noiseScale - time * 0.8;
        const n = valueNoise2(nx, ny);
        const angle = n * Math.PI * 8;
        forces[i].x = Math.cos(angle) * force;
        forces[i].y = Math.sin(angle) * force;
        i += 1;
      }
    }

    // Keep cell size "used" to preserve conceptual mapping with screen pixel space.
    void cell;
  };

  const launchParticle = () => {
    if (!particles.length) return;
    const p = particles[cursor];
    resetVec(p.position, emitter.x, emitter.y);
    resetVec(p.velocity, -1 + Math.random() * 2, -1 + Math.random() * 2);
    p.alpha = 1;
    const hue = Math.floor((emitter.x / Math.max(1, width)) * 256);
    const sat = clamp(config.hueSaturation, 0, 100);
    const lMin = clamp(config.lightnessMin, 10, 90);
    const lMax = clamp(config.lightnessMax, lMin + 1, 100);
    const lightness = randomBetween(lMin, lMax);
    p.color = `hsl(${hue}, ${sat}%, ${lightness}%)`;

    cursor += 1;
    if (cursor >= particles.length) {
      cursor = 0;
    }
  };

  const updateEmitter = () => {
    const lerpFactor = clamp(config.emitterLerp, 0.01, 0.8);
    emitter.x += (mouse.x - emitter.x) * lerpFactor;
    emitter.y += (mouse.y - emitter.y) * lerpFactor;
  };

  const followForce = (particle: Particle) => {
    const cell = clamp(config.cellSize, 8, 64);
    const cx = Math.floor(particle.position.x / cell);
    const cy = Math.floor(particle.position.y / cell);
    if (cx < 0 || cx >= cols || cy < 0 || cy >= rows) return;
    const index = cx * rows + cy;
    const f = forces[index];
    if (!f) return;
    particle.acceleration.x += f.x;
    particle.acceleration.y += f.y;
  };

  const onPointer = (x: number, y: number) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = x - rect.left;
    mouse.y = y - rect.top;
  };

  const onMouseMove = (event: MouseEvent) => onPointer(event.clientX, event.clientY);
  const onTouchMove = (event: TouchEvent) => {
    const touch = event.touches[0];
    if (!touch) return;
    onPointer(touch.clientX, touch.clientY);
  };

  window.addEventListener('mousemove', onMouseMove, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: true });

  const rebuild = (hard = true) => {
    updateSize();
    sizeSignature = `${Math.round(width)}x${Math.round(height)}`;
    initForces();
    initParticles(hard);
    mouse.x = width * 0.5;
    mouse.y = height * 0.5;
    emitter.x = width * 0.5;
    emitter.y = height * 0.5;
  };

  rebuild(true);

  const draw = (timeMs: number) => {
    updateSize();
    const nextSignature = `${Math.round(width)}x${Math.round(height)}`;
    if (nextSignature !== sizeSignature) {
      rebuild(true);
    }
    if (width <= 1 || height <= 1) {
      animationId = requestAnimationFrame(draw);
      return;
    }

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, width, height);

    updateEmitter();

    const spawnCount = clamp(Math.round(config.spawnPerFrame), 1, 30);
    for (let i = 0; i < spawnCount; i += 1) {
      launchParticle();
    }

    updateForces(timeMs);

    const drag = clamp(config.particleDrag, 0.8, 1);
    const decay = clamp(config.alphaDecay, 0.001, 0.05);

    for (const particle of particles) {
      particle.velocity.x += particle.acceleration.x;
      particle.velocity.y += particle.acceleration.y;
      particle.velocity.x *= drag;
      particle.velocity.y *= drag;
      particle.position.x += particle.velocity.x;
      particle.position.y += particle.velocity.y;
      resetVec(particle.acceleration, 0, 0);
      particle.alpha = Math.max(0, particle.alpha - decay);

      followForce(particle);

      if (particle.alpha <= 0) {
        continue;
      }

      ctx.globalAlpha = particle.alpha;
      ctx.beginPath();
      ctx.moveTo(particle.position.x + particle.points[0].x, particle.position.y + particle.points[0].y);
      ctx.lineTo(particle.position.x + particle.points[1].x, particle.position.y + particle.points[1].y);
      ctx.lineTo(particle.position.x + particle.points[2].x, particle.position.y + particle.points[2].y);
      ctx.closePath();
      ctx.fillStyle = particle.color;
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    animationId = requestAnimationFrame(draw);
  };

  animationId = requestAnimationFrame(draw);

  return {
    cleanup: () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
    },
    updateConfig: (newConfig) => {
      const prev = config;
      config = { ...newConfig };

      const needRebuild =
        prev.particleCount !== config.particleCount ||
        prev.triangleSpread !== config.triangleSpread ||
        prev.cellSize !== config.cellSize;

      if (needRebuild) {
        rebuild(false);
      }
    },
  };
};
