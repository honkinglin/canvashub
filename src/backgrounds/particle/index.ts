import type { BackgroundModule, CanvasRenderFunction, ConfigRecord } from '../../types';

export interface ParticleConfig extends ConfigRecord {
  backgroundColor: string;
  lineColor: string;
  nodeColor: string;
  gridStep: number;
  neighborCount: number;
  moveRange: number;
  moveSpeed: number;
  pointerRadius: number;
  pointerSmoothing: number;
  nodeRadiusMin: number;
  nodeRadiusMax: number;
  lineWidth: number;
  idleLineAlpha: number;
  idleNodeAlpha: number;
  idleDrift: number;
}

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

const defaultConfig: ParticleConfig = {
  backgroundColor: '#030712',
  lineColor: '#9cd9f9',
  nodeColor: '#9cd9f9',
  gridStep: 62,
  neighborCount: 5,
  moveRange: 46,
  moveSpeed: 1,
  pointerRadius: 220,
  pointerSmoothing: 0.1,
  nodeRadiusMin: 1.5,
  nodeRadiusMax: 3.8,
  lineWidth: 1,
  idleLineAlpha: 0.012,
  idleNodeAlpha: 0.05,
  idleDrift: 0.85,
};

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

const render: CanvasRenderFunction<ParticleConfig> = (canvas, ctx, initialConfig) => {
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

const generateCode = (config: ParticleConfig) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Interactive Network</title>
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
    const easeInOutSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;

    function hexToRgb(hex) {
      const normalized = hex.trim().replace('#', '');
      const full = normalized.length === 3
        ? normalized.split('').map((char) => char + char).join('')
        : normalized;
      if (!/^[0-9a-fA-F]{6}$/.test(full)) return { r: 156, g: 217, b: 249 };
      return {
        r: parseInt(full.slice(0, 2), 16),
        g: parseInt(full.slice(2, 4), 16),
        b: parseInt(full.slice(4, 6), 16)
      };
    }

    function rgba(color, alpha) {
      return 'rgba(' + color.r + ', ' + color.g + ', ' + color.b + ', ' + alpha + ')';
    }

    function createShift(point, range, speed) {
      return {
        fromX: point.x,
        fromY: point.y,
        toX: point.originX - range + Math.random() * range * 2,
        toY: point.originY - range + Math.random() * range * 2,
        elapsed: 0,
        duration: (1.2 + Math.random() * 1.8) / clamp(speed, 0.2, 4)
      };
    }

    let width = 0;
    let height = 0;
    let points = [];
    let lastTime = performance.now();
    let idleClock = 0;

    const pointer = { x: 0, y: 0, tx: 0, ty: 0, active: false };

    function updateSize() {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function createPoints() {
      const step = clamp(Math.round(config.gridStep), 28, 140);
      const list = [];
      let row = 0;
      for (let y = 0; y <= height + step; y += step) {
        let col = 0;
        for (let x = 0; x <= width + step; x += step) {
          const px = x + Math.random() * step;
          const py = y + Math.random() * step;
          const minRadius = clamp(config.nodeRadiusMin, 0.5, 8);
          const maxRadius = clamp(config.nodeRadiusMax, minRadius + 0.1, 10);
          const point = {
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
            shift: { fromX: px, fromY: py, toX: px, toY: py, elapsed: 0, duration: 1 }
          };
          point.shift = createShift(point, clamp(config.moveRange, 4, 120), config.moveSpeed);
          list.push(point);
          col += 1;
        }
        row += 1;
      }
      return list;
    }

    function assignClosestPoints() {
      if (!points.length) return;
      const rows = Math.max(...points.map((p) => p.row)) + 1;
      const cols = Math.max(...points.map((p) => p.col)) + 1;
      const grid = Array.from({ length: rows * cols }, () => []);

      for (const point of points) {
        grid[point.row * cols + point.col].push(point);
      }

      const neighborCount = clamp(Math.round(config.neighborCount), 1, 10);

      for (const point of points) {
        const candidates = [];
        for (let ring = 1; ring <= 3 && candidates.length < neighborCount * 5; ring += 1) {
          const startRow = Math.max(0, point.row - ring);
          const endRow = Math.min(rows - 1, point.row + ring);
          const startCol = Math.max(0, point.col - ring);
          const endCol = Math.min(cols - 1, point.col + ring);

          for (let r = startRow; r <= endRow; r += 1) {
            for (let c = startCol; c <= endCol; c += 1) {
              const bucket = grid[r * cols + c];
              for (const candidate of bucket) {
                if (candidate !== point) candidates.push(candidate);
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
    }

    function rebuild() {
      updateSize();
      points = createPoints();
      assignClosestPoints();
      pointer.x = width / 2;
      pointer.y = height / 2;
      pointer.tx = width / 2;
      pointer.ty = height / 2;
    }

    function onMouseMove(event) {
      pointer.tx = event.clientX;
      pointer.ty = event.clientY;
      pointer.active = true;
    }

    function onTouchMove(event) {
      const touch = event.touches[0];
      if (!touch) return;
      pointer.tx = touch.clientX;
      pointer.ty = touch.clientY;
      pointer.active = true;
    }

    function onLeave() {
      pointer.active = false;
    }

    function animate(now) {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

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
      ctx.lineWidth = clamp(config.lineWidth, 0.5, 2.5);

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
            fromY: point.y
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

      requestAnimationFrame(animate);
    }

    rebuild();
    requestAnimationFrame(animate);

    window.addEventListener('resize', rebuild);
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('mouseleave', onLeave);
    window.addEventListener('touchend', onLeave);
  </script>
</body>
</html>
`;

export const particleModule: BackgroundModule<ParticleConfig> = {
  id: 'particles',
  name: 'Network Particles',
  description: 'Interactive point-grid network with smooth drifting motion and cursor-aware glow.',
  defaultConfig,
  configSchema: [
    { id: 'backgroundColor', label: 'Background Color', type: 'color' },
    { id: 'lineColor', label: 'Line Color', type: 'color' },
    { id: 'nodeColor', label: 'Node Color', type: 'color' },
    { id: 'gridStep', label: 'Grid Step', type: 'range', options: { min: 28, max: 140, step: 2 } },
    { id: 'neighborCount', label: 'Neighbor Count', type: 'range', options: { min: 1, max: 10, step: 1 } },
    { id: 'moveRange', label: 'Move Range', type: 'range', options: { min: 4, max: 120, step: 1 } },
    { id: 'moveSpeed', label: 'Move Speed', type: 'range', options: { min: 0.2, max: 3, step: 0.1 } },
    { id: 'pointerRadius', label: 'Pointer Radius', type: 'range', options: { min: 40, max: 520, step: 5 } },
    { id: 'pointerSmoothing', label: 'Pointer Smoothing', type: 'range', options: { min: 0.01, max: 0.35, step: 0.01 } },
    { id: 'idleLineAlpha', label: 'Idle Line Alpha', type: 'range', options: { min: 0, max: 0.2, step: 0.001 } },
    { id: 'idleNodeAlpha', label: 'Idle Node Alpha', type: 'range', options: { min: 0, max: 0.35, step: 0.001 } },
    { id: 'idleDrift', label: 'Idle Drift', type: 'range', options: { min: 0, max: 1.6, step: 0.01 } },
    { id: 'nodeRadiusMin', label: 'Node Radius Min', type: 'range', options: { min: 0.5, max: 6, step: 0.1 } },
    { id: 'nodeRadiusMax', label: 'Node Radius Max', type: 'range', options: { min: 1, max: 10, step: 0.1 } },
    { id: 'lineWidth', label: 'Line Width', type: 'range', options: { min: 0.5, max: 2.5, step: 0.1 } },
  ],
  render,
  generateCode,
};
