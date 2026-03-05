import type { ParticleConfig } from './types';
export const generateCode = (config: ParticleConfig) => `<!doctype html>
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
