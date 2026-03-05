import type { CanvasRenderFunction } from '../../types';
import type { ParticleConfig } from './types';


interface ShiftState {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  elapsed: number;
  duration: number;
}

interface NetPoint {
  x: number;
  y: number;
  originX: number;
  originY: number;
  row: number;
  col: number;
  radius: number;
  closest: NetPoint[];
  lineAlpha: number;
  nodeAlpha: number;
  shift: ShiftState;
}

interface RgbColor {
  r: number;
  g: number;
  b: number;
}


const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const hexToRgb = (hex: string): RgbColor => {
  const normalized = hex.trim().replace('#', '');
  const full =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => char + char)
          .join('')
      : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    return { r: 156, g: 217, b: 249 };
  }

  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
};

const rgba = (color: RgbColor, alpha: number) => `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

const createShift = (
  point: Pick<NetPoint, 'x' | 'y' | 'originX' | 'originY'>,
  range: number,
  speed: number
): ShiftState => {
  const duration = (1.2 + Math.random() * 1.8) / clamp(speed, 0.2, 4);
  return {
    fromX: point.x,
    fromY: point.y,
    toX: point.originX - range + Math.random() * range * 2,
    toY: point.originY - range + Math.random() * range * 2,
    elapsed: 0,
    duration,
  };
};

const createPoints = (width: number, height: number, config: ParticleConfig): NetPoint[] => {
  const step = clamp(Math.round(config.gridStep), 28, 140);
  const points: NetPoint[] = [];

  let row = 0;
  for (let y = 0; y <= height + step; y += step) {
    let col = 0;
    for (let x = 0; x <= width + step; x += step) {
      const px = x + Math.random() * step;
      const py = y + Math.random() * step;
      const minRadius = clamp(config.nodeRadiusMin, 0.5, 8);
      const maxRadius = clamp(config.nodeRadiusMax, minRadius + 0.1, 10);
      const point: NetPoint = {
        x: px,
        y: py,
        originX: px,
        originY: py,
        row,
        col,
        radius: minRadius + Math.random() * (maxRadius - minRadius),
        closest: [],
        lineAlpha: 0,
        nodeAlpha: 0,
        shift: {
          fromX: px,
          fromY: py,
          toX: px,
          toY: py,
          elapsed: 0,
          duration: 1,
        },
      };
      point.shift = createShift(point, clamp(config.moveRange, 4, 120), config.moveSpeed);
      points.push(point);
      col += 1;
    }
    row += 1;
  }

  return points;
};

const assignClosestPoints = (points: NetPoint[], config: ParticleConfig) => {
  if (!points.length) return;

  const rows = Math.max(...points.map((p) => p.row)) + 1;
  const cols = Math.max(...points.map((p) => p.col)) + 1;
  const grid: NetPoint[][] = Array.from({ length: rows * cols }, () => []);

  for (const point of points) {
    grid[point.row * cols + point.col].push(point);
  }

  const neighborCount = clamp(Math.round(config.neighborCount), 1, 10);

  for (const point of points) {
    const candidates: NetPoint[] = [];

    for (let ring = 1; ring <= 3 && candidates.length < neighborCount * 5; ring += 1) {
      const startRow = Math.max(0, point.row - ring);
      const endRow = Math.min(rows - 1, point.row + ring);
      const startCol = Math.max(0, point.col - ring);
      const endCol = Math.min(cols - 1, point.col + ring);

      for (let r = startRow; r <= endRow; r += 1) {
        for (let c = startCol; c <= endCol; c += 1) {
          const bucket = grid[r * cols + c];
          for (const candidate of bucket) {
            if (candidate !== point) {
              candidates.push(candidate);
            }
          }
        }
      }
    }

    if (candidates.length < neighborCount) {
      for (const candidate of points) {
        if (candidate !== point) candidates.push(candidate);
      }
    }

    candidates.sort((a, b) => {
      const da = (point.originX - a.originX) ** 2 + (point.originY - a.originY) ** 2;
      const db = (point.originX - b.originX) ** 2 + (point.originY - b.originY) ** 2;
      return da - db;
    });

    point.closest = candidates.slice(0, neighborCount);
  }
};

export const render: CanvasRenderFunction<ParticleConfig> = (canvas, ctx, initialConfig) => {
  let config = { ...initialConfig };
  let animationId = 0;
  let lastTime = performance.now();
  let idleClock = 0;

  let width = 0;
  let height = 0;
  let sizeSignature = '';
  let points: NetPoint[] = [];

  const pointer = {
    x: 0,
    y: 0,
    tx: 0,
    ty: 0,
    active: false,
  };

  const updateSize = () => {
    const dpr = window.devicePixelRatio || 1;
    width = canvas.width / dpr;
    height = canvas.height / dpr;
  };

  const rebuild = () => {
    updateSize();
    sizeSignature = `${Math.round(width)}x${Math.round(height)}`;
    points = createPoints(width, height, config);
    assignClosestPoints(points, config);
    pointer.x = width / 2;
    pointer.y = height / 2;
    pointer.tx = width / 2;
    pointer.ty = height / 2;
  };

  const handleMouseMove = (event: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    pointer.tx = event.clientX - rect.left;
    pointer.ty = event.clientY - rect.top;
    pointer.active = true;
  };

  const handleTouchMove = (event: TouchEvent) => {
    const touch = event.touches[0];
    if (!touch) return;
    const rect = canvas.getBoundingClientRect();
    pointer.tx = touch.clientX - rect.left;
    pointer.ty = touch.clientY - rect.top;
    pointer.active = true;
  };

  const handleLeave = () => {
    pointer.active = false;
  };

  window.addEventListener('mousemove', handleMouseMove, { passive: true });
  window.addEventListener('touchmove', handleTouchMove, { passive: true });
  window.addEventListener('mouseleave', handleLeave);
  window.addEventListener('touchend', handleLeave);

  rebuild();

  const draw = (now: number) => {
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;

    updateSize();
    const nextSignature = `${Math.round(width)}x${Math.round(height)}`;
    if (nextSignature !== sizeSignature) {
      rebuild();
    }

    if (!pointer.active) {
      const drift = clamp(config.idleDrift, 0, 1.6);
      idleClock += dt * (0.4 + drift * 0.95);
      const orbit = Math.min(width, height) * (0.06 + drift * 0.2);
      pointer.tx = width / 2 + Math.cos(idleClock * 0.95) * orbit;
      pointer.ty = height / 2 + Math.sin(idleClock * 0.72) * orbit * 0.62;
    }

    const lineRgb = hexToRgb(config.lineColor);
    const nodeRgb = hexToRgb(config.nodeColor);

    const smoothing = clamp(config.pointerSmoothing, 0.01, 0.35);
    pointer.x += (pointer.tx - pointer.x) * smoothing;
    pointer.y += (pointer.ty - pointer.y) * smoothing;

    const radius = clamp(config.pointerRadius, 40, 520);
    const near = radius * 0.36;
    const mid = radius * 0.68;
    const nearSq = near * near;
    const midSq = mid * mid;
    const radiusSq = radius * radius;

    const idleLineAlpha = clamp(config.idleLineAlpha, 0, 0.2);
    const idleNodeAlpha = clamp(config.idleNodeAlpha, 0, 0.35);

    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, width, height);

    for (const point of points) {
      point.shift.elapsed += dt;
      const progress = Math.min(1, point.shift.elapsed / point.shift.duration);
      const eased = easeInOutSine(progress);
      point.x = point.shift.fromX + (point.shift.toX - point.shift.fromX) * eased;
      point.y = point.shift.fromY + (point.shift.toY - point.shift.fromY) * eased;

      if (progress >= 1) {
        point.shift = {
          ...createShift(point, clamp(config.moveRange, 4, 120), config.moveSpeed),
          fromX: point.x,
          fromY: point.y,
        };
      }

      const dx = point.x - pointer.x;
      const dy = point.y - pointer.y;
      const distSq = dx * dx + dy * dy;

      let lineAlpha = idleLineAlpha;
      let nodeAlpha = idleNodeAlpha;

      if (distSq < nearSq) {
        lineAlpha = 0.32;
        nodeAlpha = 0.62;
      } else if (distSq < midSq) {
        lineAlpha = 0.1;
        nodeAlpha = 0.32;
      } else if (distSq < radiusSq) {
        lineAlpha = Math.max(idleLineAlpha, 0.02);
        nodeAlpha = Math.max(idleNodeAlpha, 0.11);
      }

      point.lineAlpha = lineAlpha;
      point.nodeAlpha = nodeAlpha;
    }

    ctx.lineWidth = clamp(config.lineWidth, 0.5, 2.5);

    for (const point of points) {
      if (point.lineAlpha > 0) {
        ctx.strokeStyle = rgba(lineRgb, point.lineAlpha);
        for (const neighbor of point.closest) {
          ctx.beginPath();
          ctx.moveTo(point.x, point.y);
          ctx.lineTo(neighbor.x, neighbor.y);
          ctx.stroke();
        }
      }

      if (point.nodeAlpha > 0) {
        ctx.fillStyle = rgba(nodeRgb, point.nodeAlpha);
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    animationId = requestAnimationFrame(draw);
  };

  animationId = requestAnimationFrame(draw);

  return {
    cleanup: () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseleave', handleLeave);
      window.removeEventListener('touchend', handleLeave);
    },
    updateConfig: (newConfig) => {
      const prev = config;
      config = { ...newConfig };

      const needRebuild =
        prev.gridStep !== config.gridStep ||
        prev.neighborCount !== config.neighborCount ||
        prev.nodeRadiusMin !== config.nodeRadiusMin ||
        prev.nodeRadiusMax !== config.nodeRadiusMax;

      if (needRebuild) rebuild();
    },
  };
};
