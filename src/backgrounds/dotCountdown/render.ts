import type { CanvasRenderFunction } from '../../types';
import type { DotCountdownConfig } from './types';

interface Dot {
  x: number;
  y: number;
  tx: number;
  ty: number;
  roamX: number;
  roamY: number;
  alpha: number;
  targetAlpha: number;
  r: number;
  g: number;
  b: number;
}

interface Point {
  x: number;
  y: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

const createPalette = (config: DotCountdownConfig) => [config.colorA, config.colorB, config.colorC, config.colorD];

const hexToRgb = (hex: string) => {
  const normalized = hex.trim().replace('#', '');
  const full =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => char + char)
          .join('')
      : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    return { r: 255, g: 255, b: 255 };
  }

  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
};

const pickRgb = (palette: string[]) => {
  const color = palette[Math.floor(Math.random() * palette.length)];
  return hexToRgb(color);
};

const createDot = (width: number, height: number, palette: string[], roamAlpha: number): Dot => {
  const x = randomBetween(0, width);
  const y = randomBetween(0, height);
  const rgb = pickRgb(palette);
  return {
    x,
    y,
    tx: x,
    ty: y,
    roamX: x,
    roamY: y,
    alpha: roamAlpha,
    targetAlpha: roamAlpha,
    r: rgb.r,
    g: rgb.g,
    b: rgb.b,
  };
};

const setRoamTarget = (dot: Dot, width: number, height: number) => {
  dot.roamX = randomBetween(0, width);
  dot.roamY = randomBetween(0, height);
  dot.tx = dot.roamX;
  dot.ty = dot.roamY;
};

const fitTextSize = (
  ctx: CanvasRenderingContext2D,
  label: string,
  maxWidth: number,
  maxHeight: number
) => {
  let low = 20;
  let high = Math.max(80, maxHeight);
  let best = low;

  for (let i = 0; i < 22; i += 1) {
    const mid = (low + high) * 0.5;
    ctx.font = `900 ${mid}px "Lato", "SF Pro Display", "Segoe UI", sans-serif`;
    const metrics = ctx.measureText(label);
    const textWidth = metrics.width;
    const textHeight = mid * 0.92;

    if (textWidth <= maxWidth && textHeight <= maxHeight) {
      best = mid;
      low = mid;
    } else {
      high = mid;
    }
  }

  return best;
};

const sampleTextPoints = (
  label: string,
  width: number,
  height: number,
  config: DotCountdownConfig
): Point[] => {
  const offscreen = document.createElement('canvas');
  const offCtx = offscreen.getContext('2d');
  if (!offCtx) return [];

  offscreen.width = Math.max(1, Math.floor(width * 0.6));
  offscreen.height = Math.max(1, Math.floor(height * 0.5));

  offCtx.clearRect(0, 0, offscreen.width, offscreen.height);
  offCtx.textAlign = 'center';
  offCtx.textBaseline = 'middle';
  offCtx.fillStyle = '#ffffff';

  const fontSize = fitTextSize(
    offCtx,
    label,
    offscreen.width * 0.85,
    offscreen.height * 0.9
  );
  offCtx.font = `900 ${fontSize}px "Lato", "SF Pro Display", "Segoe UI", sans-serif`;
  offCtx.fillText(label, offscreen.width * 0.5, offscreen.height * 0.55);

  const data = offCtx.getImageData(0, 0, offscreen.width, offscreen.height).data;
  const points: Point[] = [];
  const step = Math.max(1, Math.round(clamp(config.dotRadius, 1, 6) * 2 + clamp(config.sampleGap, 1, 10)));
  const offsetX = (width - offscreen.width) * 0.5;
  const offsetY = (height - offscreen.height) * 0.5;

  for (let y = 0; y < offscreen.height; y += step) {
    for (let x = 0; x < offscreen.width; x += step) {
      const alpha = data[(y * offscreen.width + x) * 4 + 3];
      if (alpha > 0) {
        points.push({ x: x + offsetX, y: y + offsetY });
      }
    }
  }

  return points;
};

const shuffle = <T,>(arr: T[]) => {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
};

export const render: CanvasRenderFunction<DotCountdownConfig> = (canvas, ctx, initialConfig) => {
  let config = { ...initialConfig };
  let animationId = 0;
  let lastTime = performance.now();
  let width = 0;
  let height = 0;
  let sizeSignature = '';
  let palette = createPalette(config);

  let dots: Dot[] = [];
  let currentLabel = '';
  let countdownValue = 0;
  let showingGo = false;
  let countdownDirection: 1 | -1 = -1;
  let nextSwitchAt = 0;

  const updateSize = () => {
    const dpr = window.devicePixelRatio || 1;
    width = canvas.width / dpr;
    height = canvas.height / dpr;
  };

  const syncDotCount = (forceRecreate = false) => {
    const count = clamp(Math.round(config.dotCount), 200, 5000);
    const roamAlpha = clamp(config.roamAlpha, 0.05, 1);

    if (forceRecreate) {
      dots = Array.from({ length: count }, () => createDot(width, height, palette, roamAlpha));
      return;
    }

    while (dots.length < count) {
      dots.push(createDot(width, height, palette, roamAlpha));
    }
    if (dots.length > count) {
      dots.length = count;
    }
  };

  const applyLabel = (label: string) => {
    const points = sampleTextPoints(label, width, height, config);
    const shuffled = points.slice();
    shuffle(shuffled);

    if (shuffled.length > dots.length) {
      shuffled.length = dots.length;
    }

    for (let i = 0; i < dots.length; i += 1) {
      const dot = dots[i];
      if (i < shuffled.length) {
        dot.tx = shuffled[i].x;
        dot.ty = shuffled[i].y;
        dot.targetAlpha = clamp(config.formAlpha, 0.05, 1);
      } else {
        setRoamTarget(dot, width, height);
        dot.targetAlpha = clamp(config.roamAlpha, 0.05, 1);
      }
    }
  };

  const restartCountdown = (now: number) => {
    const start = Math.round(config.startNumber);
    const end = Math.round(config.endNumber);
    countdownDirection = start >= end ? -1 : 1;
    countdownValue = start;
    showingGo = false;
    currentLabel = String(countdownValue);
    applyLabel(currentLabel);
    nextSwitchAt = now + clamp(config.holdTime, 200, 6000);
  };

  const advanceCountdown = (scheduledAt: number) => {
    if (!showingGo) {
      const end = Math.round(config.endNumber);
      if (countdownValue === end) {
        showingGo = true;
        currentLabel = 'GO';
      } else {
        countdownValue += countdownDirection;
        currentLabel = String(countdownValue);
      }
      applyLabel(currentLabel);
      nextSwitchAt = scheduledAt + clamp(config.holdTime, 200, 6000);
      return;
    }

    if (config.loopCountdown) {
      restartCountdown(scheduledAt);
      return;
    }

    nextSwitchAt = Number.POSITIVE_INFINITY;
  };

  const rebuild = (fullReset = true) => {
    updateSize();
    sizeSignature = `${Math.round(width)}x${Math.round(height)}`;
    palette = createPalette(config);
    syncDotCount(fullReset);
    const now = performance.now();
    if (!currentLabel || fullReset) {
      restartCountdown(now);
    } else {
      applyLabel(currentLabel);
      nextSwitchAt = now + clamp(config.holdTime, 200, 6000);
    }
  };

  rebuild(true);

  const draw = (now: number) => {
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    const frameScale = dt * 60;
    lastTime = now;

    updateSize();
    const nextSignature = `${Math.round(width)}x${Math.round(height)}`;
    if (nextSignature !== sizeSignature) {
      rebuild(true);
    }
    if (width <= 1 || height <= 1) {
      animationId = requestAnimationFrame(draw);
      return;
    }

    let guard = 0;
    while (now >= nextSwitchAt && guard < 10) {
      advanceCountdown(nextSwitchAt);
      guard += 1;
    }

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, width, height);

    const moveEase = clamp(config.moveEase, 0.01, 0.4);
    const dotRadius = clamp(config.dotRadius, 1, 6);

    for (const dot of dots) {
      const step = clamp(moveEase * frameScale, 0, 1);
      dot.x += (dot.tx - dot.x) * step;
      dot.y += (dot.ty - dot.y) * step;
      dot.alpha += (dot.targetAlpha - dot.alpha) * clamp(0.08 * frameScale, 0, 1);

      if (dot.targetAlpha <= clamp(config.roamAlpha, 0.05, 1)) {
        const dist = Math.hypot(dot.tx - dot.x, dot.ty - dot.y);
        if (dist < 8) {
          setRoamTarget(dot, width, height);
        }
      }

      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dotRadius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${dot.r}, ${dot.g}, ${dot.b}, ${clamp(dot.alpha, 0.05, 1)})`;
      ctx.fill();
    }

    animationId = requestAnimationFrame(draw);
  };

  animationId = requestAnimationFrame(draw);

  return {
    cleanup: () => {
      cancelAnimationFrame(animationId);
    },
    updateConfig: (newConfig) => {
      const prev = config;
      config = { ...newConfig };

      const paletteChanged =
        prev.colorA !== config.colorA ||
        prev.colorB !== config.colorB ||
        prev.colorC !== config.colorC ||
        prev.colorD !== config.colorD;

      if (paletteChanged) {
        palette = createPalette(config);
        for (const dot of dots) {
          const rgb = pickRgb(palette);
          dot.r = rgb.r;
          dot.g = rgb.g;
          dot.b = rgb.b;
        }
      }

      const rebuildText =
        prev.dotRadius !== config.dotRadius ||
        prev.sampleGap !== config.sampleGap ||
        prev.startNumber !== config.startNumber ||
        prev.endNumber !== config.endNumber ||
        prev.dotCount !== config.dotCount;

      if (prev.dotCount !== config.dotCount) {
        syncDotCount(true);
      }

      if (
        prev.startNumber !== config.startNumber ||
        prev.endNumber !== config.endNumber ||
        prev.loopCountdown !== config.loopCountdown
      ) {
        restartCountdown(performance.now());
        return;
      }

      if (rebuildText) {
        applyLabel(currentLabel || String(Math.round(config.startNumber)));
      }

      if (prev.holdTime !== config.holdTime) {
        nextSwitchAt = performance.now() + clamp(config.holdTime, 200, 6000);
      }
    },
  };
};
