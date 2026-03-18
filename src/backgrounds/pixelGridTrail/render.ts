import type { CanvasRenderFunction } from '../../types';
import type { PixelGridTrailConfig } from './types';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  colorIndex: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

export const render: CanvasRenderFunction<PixelGridTrailConfig> = (canvas, ctx, initialConfig) => {
  let config = { ...initialConfig };
  let animationId = 0;
  let lastTime = performance.now();
  let width = 0;
  let height = 0;
  let sizeSignature = '';

  let cols = 0;
  let rows = 0;
  let cellCount = 0;

  let particles: Particle[] = [];
  let cursor = 0;

  let cellStamp = new Uint32Array(0);
  let cellAlpha = new Float32Array(0);
  let cellColorIndex = new Uint8Array(0);
  let frameId = 1;

  let palette = [config.color1, config.color2, config.color3, config.color4, config.color5];

  const baseCanvas = document.createElement('canvas');
  let baseCtx = baseCanvas.getContext('2d');

  const pointer = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
  };

  const rebuildBaseLayer = () => {
    const step = clamp(Math.round(config.gridStep), 2, 40);
    const size = clamp(Math.round(config.cellSize), 1, 40);

    cols = Math.ceil(width / step) + 1;
    rows = Math.ceil(height / step) + 1;
    cellCount = cols * rows;

    cellStamp = new Uint32Array(cellCount);
    cellAlpha = new Float32Array(cellCount);
    cellColorIndex = new Uint8Array(cellCount);
    frameId = 1;

    baseCanvas.width = Math.max(1, Math.round(width));
    baseCanvas.height = Math.max(1, Math.round(height));
    baseCtx = baseCanvas.getContext('2d');
    if (!baseCtx) return;

    baseCtx.clearRect(0, 0, width, height);
    baseCtx.fillStyle = config.baseCellColor;
    for (let y = 0; y < rows; y += 1) {
      const py = y * step;
      for (let x = 0; x < cols; x += 1) {
        baseCtx.fillRect(x * step, py, size, size);
      }
    }
  };

  const rebuildParticles = () => {
    const limit = clamp(Math.round(config.particleLimit), 10, 6000);
    particles = Array.from({ length: limit }, (_, i) => ({
      x: width * 0.5,
      y: height * 0.5,
      vx: randomBetween(-1, 1),
      vy: randomBetween(-1, 1),
      alpha: 0,
      colorIndex: i % 5,
    }));
    cursor = 0;
  };

  const rebuild = () => {
    const dpr = window.devicePixelRatio || 1;
    width = canvas.width / dpr;
    height = canvas.height / dpr;
    sizeSignature = `${Math.round(width)}x${Math.round(height)}:${config.gridStep}:${config.cellSize}:${config.particleLimit}`;

    pointer.x = width * 0.5;
    pointer.y = height * 0.5;
    pointer.targetX = pointer.x;
    pointer.targetY = pointer.y;

    rebuildBaseLayer();
    rebuildParticles();
  };

  const pointerMove = (clientX: number, clientY: number) => {
    const rect = canvas.getBoundingClientRect();
    pointer.targetX = clientX - rect.left;
    pointer.targetY = clientY - rect.top;
  };

  const onMouseMove = (event: MouseEvent) => pointerMove(event.clientX, event.clientY);
  const onTouchMove = (event: TouchEvent) => {
    const touch = event.touches[0];
    if (!touch) return;
    pointerMove(touch.clientX, touch.clientY);
  };

  canvas.addEventListener('mousemove', onMouseMove, { passive: true });
  canvas.addEventListener('touchmove', onTouchMove, { passive: true });

  const launchParticle = () => {
    if (!particles.length) return;
    const p = particles[cursor];
    p.x = pointer.x;
    p.y = pointer.y;
    p.alpha = 1;
    p.colorIndex = cursor % 5;

    const speed = clamp(config.speed, 0.05, 12);
    const angle = randomBetween(0, Math.PI * 2);
    const mag = randomBetween(speed * 0.35, speed);
    p.vx = Math.cos(angle) * mag;
    p.vy = Math.sin(angle) * mag;

    cursor += 1;
    if (cursor >= particles.length) cursor = 0;
  };

  const animate = (now: number) => {
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    const frameScale = dt * 60;
    lastTime = now;

    const dpr = window.devicePixelRatio || 1;
    const nextW = canvas.width / dpr;
    const nextH = canvas.height / dpr;
    const nextSignature = `${Math.round(nextW)}x${Math.round(nextH)}:${config.gridStep}:${config.cellSize}:${config.particleLimit}`;
    if (nextSignature !== sizeSignature) {
      rebuild();
    }
    if (width <= 1 || height <= 1) {
      animationId = requestAnimationFrame(animate);
      return;
    }

    const smooth = clamp(config.pointerSmoothing, 0.01, 0.95);
    pointer.x += (pointer.targetX - pointer.x) * smooth * frameScale;
    pointer.y += (pointer.targetY - pointer.y) * smooth * frameScale;

    const spawnCount = clamp(Math.round(config.spawnPerFrame), 1, 60);
    for (let i = 0; i < spawnCount; i += 1) {
      launchParticle();
    }

    frameId += 1;
    if (frameId > 0xfffffff0) {
      cellStamp.fill(0);
      frameId = 1;
    }

    const step = clamp(Math.round(config.gridStep), 2, 40);
    const decay = clamp(config.alphaDecay, 0.0001, 0.1);

    for (let i = 0; i < particles.length; i += 1) {
      const p = particles[i];

      const col = Math.floor(p.x / step);
      const row = Math.floor(p.y / step);
      if (col >= 0 && col < cols && row >= 0 && row < rows) {
        const idx = row * cols + col;
        if (cellStamp[idx] !== frameId || p.alpha > cellAlpha[idx]) {
          cellStamp[idx] = frameId;
          cellAlpha[idx] = p.alpha;
          cellColorIndex[idx] = p.colorIndex;
        }
      }

      if (p.alpha > 0) {
        p.alpha -= decay * frameScale;
        if (p.alpha < 0) p.alpha = 0;
      }
      p.x += p.vx * frameScale;
      p.y += p.vy * frameScale;
    }

    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, width, height);
    if (baseCtx) {
      ctx.drawImage(baseCanvas, 0, 0);
    }

    const size = clamp(Math.round(config.cellSize), 1, 40);
    for (let i = 0; i < cellCount; i += 1) {
      if (cellStamp[i] !== frameId) continue;
      const alpha = cellAlpha[i];
      if (alpha <= 0) continue;

      const col = i % cols;
      const row = Math.floor(i / cols);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = palette[cellColorIndex[i] % palette.length] || palette[0];
      ctx.fillRect(col * step, row * step, size, size);
    }
    ctx.globalAlpha = 1;

    animationId = requestAnimationFrame(animate);
  };

  rebuild();
  animationId = requestAnimationFrame(animate);

  return {
    cleanup: () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('touchmove', onTouchMove);
    },
    updateConfig: (newConfig) => {
      const prev = config;
      config = { ...newConfig };
      palette = [config.color1, config.color2, config.color3, config.color4, config.color5];

      const needFullRebuild =
        prev.gridStep !== config.gridStep ||
        prev.cellSize !== config.cellSize ||
        prev.particleLimit !== config.particleLimit;

      if (needFullRebuild) {
        rebuild();
      }
    },
  };
};
