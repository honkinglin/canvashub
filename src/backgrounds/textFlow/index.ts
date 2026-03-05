import type { BackgroundModule, CanvasRenderFunction, ConfigRecord } from '../../types';

interface Vec2 {
  x: number;
  y: number;
}

interface Particle {
  spawn: Vec2;
  x: number;
  y: number;
  vx: number;
  vy: number;
  ax: number;
  ay: number;
  size: number;
  baseSize: number;
  start: number;
  duration: number;
  drag: number;
  color: string;
}

export interface TextFlowConfig extends ConfigRecord {
  text: string;
  backgroundColor: string;
  flow: number;
  topSpeed: number;
  lifeSpan: number;
  flowOffset: number;
  gravityDirection: number;
  gravityForce: number;
  particleScale: number;
  density: number;
  particleLimit: number;
}

const COLORS = [
  '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
  '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50',
  '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722',
];

const defaultConfig: TextFlowConfig = {
  text: 'Hello',
  backgroundColor: '#ffffff',
  flow: 2,
  topSpeed: 500,
  lifeSpan: 1000,
  flowOffset: 0,
  gravityDirection: 90,
  gravityForce: 0,
  particleScale: 1,
  density: 1,
  particleLimit: 1800,
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);
const vectorFromAngle = (angle: number, magnitude: number): Vec2 => ({ x: Math.cos(angle) * magnitude, y: Math.sin(angle) * magnitude });

const hashNoise = (x: number, y: number) => {
  const v = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453123;
  return v - Math.floor(v);
};

const mapRange = (value: number, inMin: number, inMax: number, outMin: number, outMax: number) => {
  if (Math.abs(inMax - inMin) < 1e-6) return outMin;
  const t = clamp((value - inMin) / (inMax - inMin), 0, 1);
  return outMin + (outMax - outMin) * t;
};

const createOffscreen = () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  return { canvas, ctx };
};

const wrapTextByWidth = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
) => {
  const lines: string[] = [];
  const normalized = text.replace(/\r/g, '');
  const paragraphs = normalized.split('\n');

  for (const paragraph of paragraphs) {
    const chars = Array.from(paragraph);
    if (!chars.length) {
      lines.push(' ');
      continue;
    }

    let current = '';
    for (const char of chars) {
      const next = current + char;
      if (current && ctx.measureText(next).width > maxWidth) {
        lines.push(current);
        current = char;
      } else {
        current = next;
      }
    }
    if (current) {
      lines.push(current);
    }
  }

  return lines.length ? lines : ['Canvas'];
};

const truncateLinesToFit = (
  ctx: CanvasRenderingContext2D,
  lines: string[],
  maxWidth: number,
  maxLines: number
) => {
  const output = lines.slice(0, maxLines);
  const needsEllipsis = lines.length > maxLines;
  if (needsEllipsis && output.length) {
    let last = output[output.length - 1];
    while (last.length > 1 && ctx.measureText(`${last}…`).width > maxWidth) {
      last = last.slice(0, -1);
    }
    output[output.length - 1] = `${last}…`;
  }

  for (let i = 0; i < output.length; i += 1) {
    let line = output[i];
    while (line.length > 1 && ctx.measureText(line).width > maxWidth) {
      line = line.slice(0, -1);
    }
    output[i] = line;
  }

  return output.length ? output : ['Canvas'];
};

const fitMultiLineFontSize = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxHeight: number,
  maxLines: number,
  maxFont: number,
  minFont = 16
) => {
  const hiCap = Math.max(minFont, maxFont);
  let low = minFont;
  let high = hiCap;
  let best = minFont;
  let bestLines = [text];

  for (let i = 0; i < 24; i += 1) {
    const mid = (low + high) * 0.5;
    ctx.font = `700 ${mid}px "SF Pro Display", "Segoe UI", sans-serif`;
    const lines = wrapTextByWidth(ctx, text, maxWidth);
    const lineHeight = mid * 1.04;
    const blockHeight = lines.length * lineHeight;
    const fits = lines.length <= maxLines && blockHeight <= maxHeight;

    if (fits) {
      best = mid;
      bestLines = lines;
      low = mid;
    } else {
      high = mid;
    }
  }

  ctx.font = `700 ${best}px "SF Pro Display", "Segoe UI", sans-serif`;
  const fittedLines = truncateLinesToFit(ctx, bestLines, maxWidth, maxLines);

  return { fontSize: clamp(best, minFont, hiCap), lines: fittedLines };
};

const buildSpawnPoints = (
  width: number,
  height: number,
  config: TextFlowConfig,
  text: string
): { points: Vec2[]; particleSize: number } => {
  const offscreen = createOffscreen();
  if (!offscreen) return { points: [], particleSize: 8 };

  const { canvas, ctx } = offscreen;
  canvas.width = Math.max(1, Math.floor(width));
  canvas.height = Math.max(1, Math.floor(height));
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#000000';

  const safeText = (text || '').trim() || 'Canvas';
  const targetWidth = Math.min(width, 1800) * 0.97;
  const maxFont = Math.min(width, height) * 0.72;
  const maxByHeight = height * 0.82;
  const { fontSize, lines } = fitMultiLineFontSize(
    ctx,
    safeText,
    targetWidth,
    maxByHeight,
    3,
    Math.min(maxFont, maxByHeight),
    16
  );

  ctx.font = `700 ${fontSize}px "SF Pro Display", "Segoe UI", sans-serif`;
  const lineHeight = fontSize * 1.04;
  const startY = height * 0.5 - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, index) => {
    ctx.fillText(line, width * 0.5, startY + index * lineHeight);
  });

  const density = clamp(config.density, 1, 4);
  const baseStep = Math.floor(Math.max(width, height) / Math.min(160, Math.min(width, height)));
  const step = Math.max(2, Math.floor(baseStep / density) || 2);
  const particleSize = step * 3 * clamp(config.particleScale, 0.4, 2.4);

  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = image.data;
  const points: Vec2[] = [];

  for (let x = 0; x < width; x += step) {
    for (let y = 0; y < height; y += step) {
      const sx = Math.min(width - 1, x + Math.floor(step / 2));
      const sy = Math.min(height - 1, y + Math.floor(step / 2));
      const idx = (sy * canvas.width + sx) * 4 + 3;
      if (data[idx] > 6) {
        points.push({ x: sx, y: sy });
      }
    }
  }

  const limit = clamp(Math.floor(config.particleLimit), 100, 5000);
  if (points.length > limit) {
    for (let i = points.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [points[i], points[j]] = [points[j], points[i]];
    }
    points.length = limit;
  }

  return { points, particleSize };
};

const render: CanvasRenderFunction<TextFlowConfig> = (canvas, ctx, initialConfig) => {
  let config = { ...initialConfig };
  let animationId = 0;
  let lastNow = performance.now();

  let width = 0;
  let height = 0;
  let signature = '';

  let fieldStep = 20;
  let fieldCols = 0;
  let fieldRows = 0;
  let flowField: number[] = [];

  let spawnPoints: Vec2[] = [];
  let particles: Particle[] = [];
  let particleBaseSize = 8;

  const resolveText = () => (config.text || 'Hello').trim() || 'Hello';

  const updateSize = () => {
    const dpr = window.devicePixelRatio || 1;
    width = canvas.width / dpr;
    height = canvas.height / dpr;
  };

  const getGravity = (): Vec2 => {
    const direction = (clamp(config.gravityDirection, 0, 360) * Math.PI) / 180;
    return vectorFromAngle(direction, clamp(config.gravityForce, 0, 100));
  };

  const createParticle = (spawn: Vec2, now: number): Particle => {
    const p: Particle = {
      spawn,
      x: spawn.x,
      y: spawn.y,
      vx: 0,
      vy: 0,
      ax: 0,
      ay: 0,
      size: 1,
      baseSize: particleBaseSize,
      start: now,
      duration: 1000,
      drag: 1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };

    const initBurst = vectorFromAngle(randomBetween(0, Math.PI * 2), randomBetween(0, 10));
    p.vx += initBurst.x;
    p.vy += initBurst.y;
    p.duration = clamp(config.lifeSpan, 100, 2000) * randomBetween(0.2, 1.2);
    p.drag = randomBetween(0.9, 1);
    p.size = p.baseSize * randomBetween(0.5, 1.5);
    return p;
  };

  const resetParticle = (particle: Particle, now: number) => {
    const spawn = spawnPoints[Math.floor(Math.random() * spawnPoints.length)] ?? { x: width * 0.5, y: height * 0.5 };
    particle.spawn = spawn;
    particle.x = spawn.x;
    particle.y = spawn.y;
    particle.vx = 0;
    particle.vy = 0;
    particle.ax = 0;
    particle.ay = 0;
    particle.start = now;
    particle.duration = clamp(config.lifeSpan, 100, 2000) * randomBetween(0.2, 1.2);
    particle.drag = randomBetween(0.9, 1);
    particle.size = particle.baseSize * randomBetween(0.5, 1.5);
    particle.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const initBurst = vectorFromAngle(randomBetween(0, Math.PI * 2), randomBetween(0, 10));
    particle.vx += initBurst.x;
    particle.vy += initBurst.y;
  };

  const rebuildField = () => {
    fieldStep = Math.max(8, Math.floor(Math.max(width, height) / Math.min(20, Math.min(width, height))));
    fieldCols = Math.ceil(width / fieldStep) + 1;
    fieldRows = Math.ceil(height / fieldStep) + 1;
    flowField = new Array(fieldCols * fieldRows);

    let i = 0;
    for (let y = 0; y < fieldRows; y += 1) {
      for (let x = 0; x < fieldCols; x += 1) {
        i += 1;
        const n = hashNoise(i, x * 0.41 + y * 0.73);
        flowField[y * fieldCols + x] = n * Math.PI * 2;
      }
    }
  };

  const rebuildParticles = () => {
    const result = buildSpawnPoints(width, height, config, resolveText());
    spawnPoints = result.points;
    particleBaseSize = result.particleSize;

    const now = performance.now();
    particles = spawnPoints.map((point) => createParticle(point, now));
    if (!particles.length) {
      particles = [createParticle({ x: width * 0.5, y: height * 0.5 }, now)];
    }
  };

  const rebuildAll = () => {
    updateSize();
    signature = `${Math.round(width)}x${Math.round(height)}`;
    rebuildField();
    rebuildParticles();
  };

  rebuildAll();

  const draw = (now: number) => {
    const dt = Math.min(0.05, (now - lastNow) / 1000);
    const dt60 = dt * 60;
    lastNow = now;

    updateSize();
    const nextSig = `${Math.round(width)}x${Math.round(height)}`;
    if (nextSig !== signature) {
      rebuildAll();
    }

    const gravity = getGravity();
    const flowMag = clamp(config.flow, 0, 100);
    const flowOffset = config.flowOffset;
    const topSpeed = clamp(config.topSpeed, 10, 1000);

    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, width, height);

    for (const particle of particles) {
      const col = clamp(Math.floor(particle.x / fieldStep), 0, Math.max(0, fieldCols - 1));
      const row = clamp(Math.floor(particle.y / fieldStep), 0, Math.max(0, fieldRows - 1));
      const angle = flowField[row * fieldCols + col] + flowOffset;
      const flowForce = vectorFromAngle(angle, flowMag);

      particle.ax += gravity.x + flowForce.x;
      particle.ay += gravity.y + flowForce.y;

      particle.vx += particle.ax * dt60;
      particle.vy += particle.ay * dt60;

      const speed = Math.hypot(particle.vx, particle.vy);
      if (speed > topSpeed) {
        const ratio = topSpeed / speed;
        particle.vx *= ratio;
        particle.vy *= ratio;
      }

      const dragPow = Math.pow(particle.drag, dt60);
      particle.vx *= dragPow;
      particle.vy *= dragPow;

      particle.x += particle.vx * dt60 * (1 / 60);
      particle.y += particle.vy * dt60 * (1 / 60);

      particle.ax = 0;
      particle.ay = 0;

      const age = now - particle.start;
      const life = Math.max(1, particle.duration);
      let scale = 1;
      if (age < life * 0.1) {
        scale = mapRange(age, 0, life * 0.1, 0, 1);
      } else if (age > life * 0.5) {
        scale = mapRange(age, life * 0.5, life, 1, 0);
      }

      const speedScale = mapRange(Math.hypot(particle.vx, particle.vy), 0, topSpeed, 0.5, 1.2);
      const radius = particle.size * scale * speedScale * 0.5;

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.fill();

      if (particle.y > height + 16 || age > life) {
        resetParticle(particle, now);
      }
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

      const structuralChange =
        prev.text !== config.text ||
        prev.density !== config.density ||
        prev.particleLimit !== config.particleLimit ||
        prev.particleScale !== config.particleScale;

      if (structuralChange) {
        rebuildParticles();
      }
    },
  };
};

const generateCode = (config: TextFlowConfig) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Text Flow Particles</title>
  <style>
    html, body { margin: 0; width: 100%; height: 100%; overflow: hidden; background: ${config.backgroundColor}; }
    canvas { display: block; width: 100%; height: 100%; }
  </style>
</head>
<body>
  <canvas id="canvas"></canvas>
  <script>
    const config = ${JSON.stringify(config, null, 2)};
    const COLORS = [
      '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
      '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50',
      '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'
    ];

    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const randomBetween = (min, max) => min + Math.random() * (max - min);
    const vectorFromAngle = (angle, magnitude) => ({ x: Math.cos(angle) * magnitude, y: Math.sin(angle) * magnitude });
    const mapRange = (value, inMin, inMax, outMin, outMax) => {
      if (Math.abs(inMax - inMin) < 1e-6) return outMin;
      const t = clamp((value - inMin) / (inMax - inMin), 0, 1);
      return outMin + (outMax - outMin) * t;
    };
    const hashNoise = (x, y) => {
      const v = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453123;
      return v - Math.floor(v);
    };

    function wrapTextByWidth(ctx, text, maxWidth) {
      const lines = [];
      const normalized = text.replace(/\r/g, '');
      const paragraphs = normalized.split('\n');

      for (const paragraph of paragraphs) {
        const chars = Array.from(paragraph);
        if (!chars.length) {
          lines.push(' ');
          continue;
        }

        let current = '';
        for (const char of chars) {
          const next = current + char;
          if (current && ctx.measureText(next).width > maxWidth) {
            lines.push(current);
            current = char;
          } else {
            current = next;
          }
        }
        if (current) lines.push(current);
      }

      return lines.length ? lines : ['Canvas'];
    }

    function truncateLinesToFit(ctx, lines, maxWidth, maxLines) {
      const output = lines.slice(0, maxLines);
      const needsEllipsis = lines.length > maxLines;
      if (needsEllipsis && output.length) {
        let last = output[output.length - 1];
        while (last.length > 1 && ctx.measureText(last + '…').width > maxWidth) {
          last = last.slice(0, -1);
        }
        output[output.length - 1] = last + '…';
      }

      for (let i = 0; i < output.length; i++) {
        let line = output[i];
        while (line.length > 1 && ctx.measureText(line).width > maxWidth) {
          line = line.slice(0, -1);
        }
        output[i] = line;
      }

      return output.length ? output : ['Canvas'];
    }

    function fitMultiLineFontSize(ctx, text, maxWidth, maxHeight, maxLines, maxFont, minFont) {
      const min = minFont || 16;
      const hiCap = Math.max(min, maxFont);
      let low = min;
      let high = hiCap;
      let best = min;
      let bestLines = [text];

      for (let i = 0; i < 24; i++) {
        const mid = (low + high) * 0.5;
        ctx.font = '700 ' + mid + 'px "SF Pro Display", "Segoe UI", sans-serif';
        const lines = wrapTextByWidth(ctx, text, maxWidth);
        const lineHeight = mid * 1.04;
        const blockHeight = lines.length * lineHeight;
        const fits = lines.length <= maxLines && blockHeight <= maxHeight;

        if (fits) {
          best = mid;
          bestLines = lines;
          low = mid;
        } else {
          high = mid;
        }
      }

      ctx.font = '700 ' + best + 'px "SF Pro Display", "Segoe UI", sans-serif';
      const lines = truncateLinesToFit(ctx, bestLines, maxWidth, maxLines);
      return { fontSize: clamp(best, min, hiCap), lines };
    }

    let width = 0;
    let height = 0;
    let fieldStep = 20;
    let fieldCols = 0;
    let fieldRows = 0;
    let flowField = [];
    let spawnPoints = [];
    let particles = [];
    let particleBaseSize = 8;
    let lastNow = performance.now();

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function buildSpawnPoints() {
      const off = document.createElement('canvas');
      const offCtx = off.getContext('2d');
      off.width = width;
      off.height = height;
      offCtx.clearRect(0, 0, width, height);
      offCtx.fillStyle = '#000';
      offCtx.textAlign = 'center';
      offCtx.textBaseline = 'middle';

      const text = (config.text || 'Hello').trim() || 'Hello';
      const targetWidth = Math.min(width, 1800) * 0.97;
      const maxFont = Math.min(width, height) * 0.72;
      const maxByHeight = height * 0.82;
      const fitted = fitMultiLineFontSize(
        offCtx,
        text,
        targetWidth,
        maxByHeight,
        3,
        Math.min(maxFont, maxByHeight),
        16
      );
      offCtx.font = '700 ' + fitted.fontSize + 'px "SF Pro Display", "Segoe UI", sans-serif';
      const lineHeight = fitted.fontSize * 1.04;
      const startY = height * 0.5 - ((fitted.lines.length - 1) * lineHeight) / 2;
      for (let i = 0; i < fitted.lines.length; i++) {
        offCtx.fillText(fitted.lines[i], width * 0.5, startY + i * lineHeight);
      }

      const density = clamp(config.density, 1, 4);
      const baseStep = Math.floor(Math.max(width, height) / Math.min(160, Math.min(width, height)));
      const step = Math.max(2, Math.floor(baseStep / density) || 2);
      particleBaseSize = step * 3 * clamp(config.particleScale, 0.4, 2.4);

      const image = offCtx.getImageData(0, 0, width, height).data;
      spawnPoints = [];
      for (let x = 0; x < width; x += step) {
        for (let y = 0; y < height; y += step) {
          const sx = Math.min(width - 1, x + Math.floor(step / 2));
          const sy = Math.min(height - 1, y + Math.floor(step / 2));
          const idx = (sy * width + sx) * 4 + 3;
          if (image[idx] > 6) spawnPoints.push({ x: sx, y: sy });
        }
      }

      const limit = clamp(Math.floor(config.particleLimit), 100, 5000);
      if (spawnPoints.length > limit) {
        for (let i = spawnPoints.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [spawnPoints[i], spawnPoints[j]] = [spawnPoints[j], spawnPoints[i]];
        }
        spawnPoints.length = limit;
      }
    }

    function buildField() {
      fieldStep = Math.max(8, Math.floor(Math.max(width, height) / Math.min(20, Math.min(width, height))));
      fieldCols = Math.ceil(width / fieldStep) + 1;
      fieldRows = Math.ceil(height / fieldStep) + 1;
      flowField = new Array(fieldCols * fieldRows);
      let i = 0;
      for (let y = 0; y < fieldRows; y++) {
        for (let x = 0; x < fieldCols; x++) {
          i += 1;
          flowField[y * fieldCols + x] = hashNoise(i, x * 0.41 + y * 0.73) * Math.PI * 2;
        }
      }
    }

    function createParticle(spawn, now) {
      const p = {
        spawn,
        x: spawn.x,
        y: spawn.y,
        vx: 0,
        vy: 0,
        ax: 0,
        ay: 0,
        size: particleBaseSize * randomBetween(0.5, 1.5),
        baseSize: particleBaseSize,
        start: now,
        duration: clamp(config.lifeSpan, 100, 2000) * randomBetween(0.2, 1.2),
        drag: randomBetween(0.9, 1),
        color: COLORS[Math.floor(Math.random() * COLORS.length)]
      };
      const burst = vectorFromAngle(randomBetween(0, Math.PI * 2), randomBetween(0, 10));
      p.vx += burst.x;
      p.vy += burst.y;
      return p;
    }

    function resetParticle(p, now) {
      const spawn = spawnPoints[Math.floor(Math.random() * spawnPoints.length)] || { x: width * 0.5, y: height * 0.5 };
      p.spawn = spawn;
      p.x = spawn.x;
      p.y = spawn.y;
      p.vx = 0;
      p.vy = 0;
      p.ax = 0;
      p.ay = 0;
      p.size = p.baseSize * randomBetween(0.5, 1.5);
      p.start = now;
      p.duration = clamp(config.lifeSpan, 100, 2000) * randomBetween(0.2, 1.2);
      p.drag = randomBetween(0.9, 1);
      p.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const burst = vectorFromAngle(randomBetween(0, Math.PI * 2), randomBetween(0, 10));
      p.vx += burst.x;
      p.vy += burst.y;
    }

    function rebuildParticles() {
      buildSpawnPoints();
      const now = performance.now();
      particles = spawnPoints.map((point) => createParticle(point, now));
      if (!particles.length) particles = [createParticle({ x: width * 0.5, y: height * 0.5 }, now)];
    }

    function rebuildAll() {
      resize();
      buildField();
      rebuildParticles();
    }

    function animate(now) {
      const dt = Math.min(0.05, (now - lastNow) / 1000);
      const dt60 = dt * 60;
      lastNow = now;

      const gDir = clamp(config.gravityDirection, 0, 360) * Math.PI / 180;
      const gravity = vectorFromAngle(gDir, clamp(config.gravityForce, 0, 100));
      const flowMag = clamp(config.flow, 0, 100);
      const topSpeed = clamp(config.topSpeed, 10, 1000);

      ctx.fillStyle = config.backgroundColor;
      ctx.fillRect(0, 0, width, height);

      for (const p of particles) {
        const col = clamp(Math.floor(p.x / fieldStep), 0, Math.max(0, fieldCols - 1));
        const row = clamp(Math.floor(p.y / fieldStep), 0, Math.max(0, fieldRows - 1));
        const angle = flowField[row * fieldCols + col] + config.flowOffset;
        const flowForce = vectorFromAngle(angle, flowMag);

        p.ax += gravity.x + flowForce.x;
        p.ay += gravity.y + flowForce.y;

        p.vx += p.ax * dt60;
        p.vy += p.ay * dt60;

        const speed = Math.hypot(p.vx, p.vy);
        if (speed > topSpeed) {
          const ratio = topSpeed / speed;
          p.vx *= ratio;
          p.vy *= ratio;
        }

        const dragPow = Math.pow(p.drag, dt60);
        p.vx *= dragPow;
        p.vy *= dragPow;

        p.x += p.vx * dt60 * (1 / 60);
        p.y += p.vy * dt60 * (1 / 60);

        p.ax = 0;
        p.ay = 0;

        const age = now - p.start;
        const life = Math.max(1, p.duration);
        let scale = 1;
        if (age < life * 0.1) scale = mapRange(age, 0, life * 0.1, 0, 1);
        else if (age > life * 0.5) scale = mapRange(age, life * 0.5, life, 1, 0);

        const speedScale = mapRange(Math.hypot(p.vx, p.vy), 0, topSpeed, 0.5, 1.2);
        const radius = p.size * scale * speedScale * 0.5;

        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        if (p.y > height + 16 || age > life) {
          resetParticle(p, now);
        }
      }

      requestAnimationFrame(animate);
    }

    rebuildAll();
    requestAnimationFrame(animate);
    window.addEventListener('resize', rebuildAll);
  </script>
</body>
</html>
`;

export const textFlowModule: BackgroundModule<TextFlowConfig> = {
  id: 'text-flow',
  name: 'Text Flow',
  description: 'Particles emit from text and drift through a configurable flow field and gravity.',
  defaultConfig,
  configSchema: [
    { id: 'text', label: 'Text', type: 'text' },
    { id: 'backgroundColor', label: 'Background Color', type: 'color' },
    { id: 'flow', label: 'Flow', type: 'range', options: { min: 0, max: 100, step: 1 } },
    { id: 'topSpeed', label: 'Top Speed', type: 'range', options: { min: 10, max: 1000, step: 5 } },
    { id: 'lifeSpan', label: 'Lifespan', type: 'range', options: { min: 100, max: 2000, step: 10 } },
    { id: 'flowOffset', label: 'Flow Offset', type: 'range', options: { min: 0, max: Math.PI * 2, step: 0.01 } },
    { id: 'gravityDirection', label: 'Gravity Direction', type: 'range', options: { min: 0, max: 360, step: 1 } },
    { id: 'gravityForce', label: 'Gravity Force', type: 'range', options: { min: 0, max: 100, step: 1 } },
    { id: 'particleScale', label: 'Particle Scale', type: 'range', options: { min: 0.4, max: 2.4, step: 0.05 } },
    { id: 'density', label: 'Density', type: 'range', options: { min: 1, max: 4, step: 0.1 } },
    { id: 'particleLimit', label: 'Particle Limit', type: 'range', options: { min: 100, max: 5000, step: 50 } },
  ],
  render,
  generateCode,
};
