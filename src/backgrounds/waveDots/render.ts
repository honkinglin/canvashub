import type { CanvasRenderFunction } from '../../types';
import type { WaveDotsConfig } from './types';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const render: CanvasRenderFunction<WaveDotsConfig> = (canvas, ctx, initialConfig) => {
  let config = { ...initialConfig };
  let animationId = 0;
  let width = 0;
  let height = 0;
  let sizeSignature = '';
  let lastTime = performance.now();

  let rows = 0;
  let cols = 0;
  let count = 0;
  let xDist = 0;
  let yDist = 0;

  let baseX = new Float32Array(0);
  let baseY = new Float32Array(0);
  let rowIndex = new Uint16Array(0);
  let colIndex = new Uint16Array(0);
  let scaleValue = new Float32Array(0);

  const mouse = {
    x: 0,
    y: 0,
    manual: false,
    lastManualAt: 0,
  };

  const updateSize = () => {
    const dpr = window.devicePixelRatio || 1;
    width = canvas.width / dpr;
    height = canvas.height / dpr;
  };

  const rebuild = () => {
    updateSize();

    rows = clamp(Math.round(config.rows), 4, 220);
    cols = clamp(Math.round(config.cols), 4, 280);
    count = rows * cols;
    xDist = width / cols;
    yDist = height / rows;

    baseX = new Float32Array(count);
    baseY = new Float32Array(count);
    rowIndex = new Uint16Array(count);
    colIndex = new Uint16Array(count);
    scaleValue = new Float32Array(count);

    for (let i = 0; i < count; i += 1) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      baseX[i] = xDist * (col + 0.5);
      baseY[i] = yDist * (row + 0.5);
      rowIndex[i] = row;
      colIndex[i] = col;
      scaleValue[i] = 1;
    }

    mouse.x = width * 0.5;
    mouse.y = height * 0.5;
    mouse.manual = false;
    sizeSignature = `${Math.round(width)}x${Math.round(height)}:${rows}x${cols}`;
  };

  const updatePointer = (clientX: number, clientY: number) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = clientX - rect.left;
    mouse.y = clientY - rect.top;
    mouse.manual = true;
    mouse.lastManualAt = performance.now();
  };

  const onMouseMove = (event: MouseEvent) => updatePointer(event.clientX, event.clientY);
  const onTouchMove = (event: TouchEvent) => {
    const touch = event.touches[0];
    if (!touch) return;
    updatePointer(touch.clientX, touch.clientY);
  };
  const onLeave = () => {
    mouse.manual = false;
  };

  canvas.addEventListener('mousemove', onMouseMove, { passive: true });
  canvas.addEventListener('touchmove', onTouchMove, { passive: true });
  canvas.addEventListener('mouseleave', onLeave);
  canvas.addEventListener('touchend', onLeave);
  canvas.addEventListener('touchcancel', onLeave);

  rebuild();

  const draw = (now: number) => {
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    const frameScale = dt * 60;
    lastTime = now;

    updateSize();
    const nextSignature = `${Math.round(width)}x${Math.round(height)}:${Math.round(config.rows)}x${Math.round(config.cols)}`;
    if (nextSignature !== sizeSignature) {
      rebuild();
    }

    if (width <= 1 || height <= 1) {
      animationId = requestAnimationFrame(draw);
      return;
    }

    const autoMotionEnabled = config.autoMotion && (!mouse.manual || now - mouse.lastManualAt > 1500);
    if (autoMotionEnabled) {
      const t = now * 0.001;
      mouse.x = width * 0.5 + Math.cos(t * 0.8) * width * 0.35;
      mouse.y = height * 0.5 + Math.sin(t * 1.1) * height * 0.3;
    }

    const radius = clamp(config.pointerRadius, 1, 1000);
    const radiusSq = radius * radius;
    const force = clamp(config.pointerForce, 0.001, 8);
    const decay = clamp(config.alphaDecay, 0.01, 60);
    const maxScale = clamp(config.maxScale, 2, 4000);
    const gain = clamp(config.radiusGain, 0.2, 80);
    const baseRadius = clamp(config.baseRadius, 0.1, 20);
    const waveSpeed = clamp(config.waveSpeed, 0, 20);
    const waveAmp = clamp(config.waveAmplitude, 0, 8);
    const waveFreq = clamp(config.waveFrequency, 0.01, 6);

    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = config.dotColor;
    ctx.beginPath();

    const t = now * 0.0025 * waveSpeed;
    for (let i = 0; i < count; i += 1) {
      const dx = mouse.x - baseX[i];
      const dy = mouse.y - baseY[i];
      const distSq = dx * dx + dy * dy;

      let s = scaleValue[i];
      if (distSq < radiusSq) {
        const dist = Math.sqrt(distSq);
        s += (radius + 50 - dist) * force * frameScale;
      } else {
        s -= decay * frameScale;
      }
      if (s > maxScale) s = maxScale;
      if (s < 1) s = 1;
      scaleValue[i] = s;

      if (s <= 1.01) continue;

      const tx = Math.sin(rowIndex[i] * waveFreq + t) * xDist * waveAmp;
      const ty = Math.cos(colIndex[i] * waveFreq + t) * yDist * waveAmp;
      const px = baseX[i] + tx;
      const py = baseY[i] + ty;
      const pr = baseRadius + s / gain;

      ctx.moveTo(px + pr, py);
      ctx.arc(px, py, pr, 0, Math.PI * 2);
    }

    ctx.fill();
    animationId = requestAnimationFrame(draw);
  };

  animationId = requestAnimationFrame(draw);

  return {
    cleanup: () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('mouseleave', onLeave);
      canvas.removeEventListener('touchend', onLeave);
      canvas.removeEventListener('touchcancel', onLeave);
    },
    updateConfig: (newConfig) => {
      const prev = config;
      config = { ...newConfig };
      if (prev.rows !== config.rows || prev.cols !== config.cols) {
        rebuild();
      }
    },
  };
};
