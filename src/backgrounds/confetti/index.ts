import type { BackgroundModule, CanvasRenderFunction, ConfigRecord } from '../../types';

interface Rgb {
  r: number;
  g: number;
  b: number;
}

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  opacity: number;
  dop: number;
  color: Rgb;
  seed: number;
}

export interface ConfettiConfig extends ConfigRecord {
  backgroundColor: string;
  confettiCount: number;
  sizeMin: number;
  sizeMax: number;
  fallSpeed: number;
  horizontalDrift: number;
  mouseInfluence: number;
  fadeSpeed: number;
  colorA: string;
  colorB: string;
  colorC: string;
  colorD: string;
  colorE: string;
}

const defaultConfig: ConfettiConfig = {
  backgroundColor: '#0b1020',
  confettiCount: 260,
  sizeMin: 2,
  sizeMax: 6,
  fallSpeed: 1.35,
  horizontalDrift: 1.9,
  mouseInfluence: 2.2,
  fadeSpeed: 0.034,
  colorA: '#55476A',
  colorB: '#AE3D63',
  colorC: '#DB3853',
  colorD: '#F45C44',
  colorE: '#F8B646',
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

const hexToRgb = (hex: string): Rgb => {
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

const createPalette = (config: ConfettiConfig): Rgb[] => [
  hexToRgb(config.colorA),
  hexToRgb(config.colorB),
  hexToRgb(config.colorC),
  hexToRgb(config.colorD),
  hexToRgb(config.colorE),
];

const makeParticle = (palette: Rgb[]): ConfettiParticle => ({
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  r: 3,
  opacity: 0,
  dop: 0,
  color: palette[Math.floor(Math.random() * palette.length)],
  seed: Math.random() * Math.PI * 2,
});

const respawnParticle = (
  particle: ConfettiParticle,
  width: number,
  height: number,
  palette: Rgb[],
  config: ConfettiConfig,
  mouseNormX: number,
  fromTop: boolean
) => {
  const sizeMin = clamp(config.sizeMin, 1, 16);
  const sizeMax = clamp(config.sizeMax, sizeMin + 0.1, 24);
  const drift = clamp(config.horizontalDrift, 0, 5);

  particle.r = randomBetween(sizeMin, sizeMax);
  particle.opacity = fromTop ? randomBetween(0.05, 0.4) : randomBetween(0.35, 1);
  particle.dop = clamp(config.fadeSpeed, 0.005, 0.2) * randomBetween(0.8, 2.6);
  particle.x = randomBetween(-particle.r * 2, width - particle.r * 2);
  particle.y = fromTop ? randomBetween(-30, -particle.r * 2) : randomBetween(-particle.r * 2, height - particle.r * 2);
  particle.vx = randomBetween(-drift, drift) + (mouseNormX - 0.5) * clamp(config.mouseInfluence, 0, 4) * 5;
  particle.vy = clamp(config.fallSpeed, 0.2, 6) * randomBetween(0.55, 1.5) + particle.r * 0.08;
  particle.color = palette[Math.floor(Math.random() * palette.length)];
  particle.seed = Math.random() * Math.PI * 2;
};

const render: CanvasRenderFunction<ConfettiConfig> = (canvas, ctx, initialConfig) => {
  let config = { ...initialConfig };
  let palette = createPalette(config);
  let animationId = 0;
  let lastTime = performance.now();
  let time = 0;
  let width = 0;
  let height = 0;
  const particles: ConfettiParticle[] = [];

  const pointer = {
    xNorm: 0.5,
    targetXNorm: 0.5,
    active: false,
  };

  const updateSize = () => {
    const dpr = window.devicePixelRatio || 1;
    width = canvas.width / dpr;
    height = canvas.height / dpr;
  };

  const syncCount = () => {
    const count = clamp(Math.round(config.confettiCount), 20, 1200);
    while (particles.length < count) {
      const particle = makeParticle(palette);
      respawnParticle(particle, width, height, palette, config, pointer.xNorm, false);
      particles.push(particle);
    }
    if (particles.length > count) {
      particles.length = count;
    }
  };

  const rebuildAll = () => {
    updateSize();
    palette = createPalette(config);
    syncCount();
    for (const particle of particles) {
      respawnParticle(particle, width, height, palette, config, pointer.xNorm, false);
    }
  };

  const onMouseMove = (event: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    const localX = event.clientX - rect.left;
    pointer.targetXNorm = clamp(localX / Math.max(1, width), 0, 1);
    pointer.active = true;
  };

  const onTouchMove = (event: TouchEvent) => {
    const touch = event.touches[0];
    if (!touch) return;
    const rect = canvas.getBoundingClientRect();
    const localX = touch.clientX - rect.left;
    pointer.targetXNorm = clamp(localX / Math.max(1, width), 0, 1);
    pointer.active = true;
  };

  const onLeave = () => {
    pointer.active = false;
    pointer.targetXNorm = 0.5;
  };

  window.addEventListener('mousemove', onMouseMove, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: true });
  window.addEventListener('mouseleave', onLeave);
  window.addEventListener('touchend', onLeave);

  rebuildAll();

  const draw = (now: number) => {
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    time += dt;

    updateSize();
    syncCount();

    pointer.xNorm += (pointer.targetXNorm - pointer.xNorm) * (pointer.active ? 0.14 : 0.06);
    const mousePush = (pointer.xNorm - 0.5) * clamp(config.mouseInfluence, 0, 4);
    const drift = clamp(config.horizontalDrift, 0, 5);

    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, width, height);

    const frameScale = dt * 60;
    for (const particle of particles) {
      const wind = Math.sin(time * 0.65 + particle.seed) * drift * 0.03;
      const attraction = ((pointer.xNorm * width - particle.x) / Math.max(1, width)) * clamp(config.mouseInfluence, 0, 4) * 2.1;
      const targetVx = randomBetween(-drift, drift) * 0.2 + mousePush * 1.15 + attraction;
      particle.vx += (targetVx - particle.vx) * 0.025 * frameScale;
      particle.vx += wind * frameScale;

      particle.x += particle.vx * frameScale;
      particle.y += particle.vy * frameScale;

      particle.opacity += particle.dop * frameScale * 0.35;
      if (particle.opacity > 1) {
        particle.opacity = 1;
        particle.dop *= -1;
      }
      if (particle.opacity < 0.2) {
        particle.opacity = 0.2;
        particle.dop = Math.abs(particle.dop);
      }

      if (particle.y > height + particle.r * 2) {
        respawnParticle(particle, width, height, palette, config, pointer.xNorm, true);
      }

      if (particle.x < -particle.r * 2) {
        particle.x = width + particle.r;
      } else if (particle.x > width + particle.r * 2) {
        particle.x = -particle.r;
      }

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${clamp(particle.opacity, 0, 1)})`;
      ctx.fill();
    }

    animationId = requestAnimationFrame(draw);
  };

  animationId = requestAnimationFrame(draw);

  return {
    cleanup: () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('touchend', onLeave);
    },
    updateConfig: (newConfig) => {
      const prev = config;
      config = { ...newConfig };

      const countChanged = prev.confettiCount !== config.confettiCount;
      const paletteChanged =
        prev.colorA !== config.colorA ||
        prev.colorB !== config.colorB ||
        prev.colorC !== config.colorC ||
        prev.colorD !== config.colorD ||
        prev.colorE !== config.colorE;
      const sizeChanged = prev.sizeMin !== config.sizeMin || prev.sizeMax !== config.sizeMax;

      if (paletteChanged) {
        palette = createPalette(config);
      }
      if (countChanged || paletteChanged || sizeChanged) {
        rebuildAll();
      }
    },
  };
};

const generateCode = (config: ConfettiConfig) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confetti Drift</title>
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
      if (!/^[0-9a-fA-F]{6}$/.test(full)) return { r: 255, g: 255, b: 255 };
      return {
        r: parseInt(full.slice(0, 2), 16),
        g: parseInt(full.slice(2, 4), 16),
        b: parseInt(full.slice(4, 6), 16)
      };
    }

    function createPalette() {
      return [config.colorA, config.colorB, config.colorC, config.colorD, config.colorE].map(hexToRgb);
    }

    let palette = createPalette();
    let width = 0;
    let height = 0;
    let lastTime = performance.now();
    let time = 0;
    let particles = [];

    const pointer = { xNorm: 0.5, targetXNorm: 0.5, active: false };

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

    function spawnParticle(fromTop) {
      const sizeMin = clamp(config.sizeMin, 1, 16);
      const sizeMax = clamp(config.sizeMax, sizeMin + 0.1, 24);
      const drift = clamp(config.horizontalDrift, 0, 5);
      const r = randomBetween(sizeMin, sizeMax);
      return {
        x: randomBetween(-r * 2, width - r * 2),
        y: fromTop ? randomBetween(-30, -r * 2) : randomBetween(-r * 2, height - r * 2),
        vx: randomBetween(-drift, drift) + (pointer.xNorm - 0.5) * clamp(config.mouseInfluence, 0, 4) * 5,
        vy: clamp(config.fallSpeed, 0.2, 6) * randomBetween(0.55, 1.5) + r * 0.08,
        r,
        opacity: fromTop ? randomBetween(0.05, 0.4) : randomBetween(0.35, 1),
        dop: clamp(config.fadeSpeed, 0.005, 0.2) * randomBetween(0.8, 2.6),
        color: palette[Math.floor(Math.random() * palette.length)],
        seed: Math.random() * Math.PI * 2
      };
    }

    function syncCount() {
      const count = clamp(Math.round(config.confettiCount), 20, 1200);
      while (particles.length < count) particles.push(spawnParticle(false));
      if (particles.length > count) particles.length = count;
    }

    function rebuild() {
      resize();
      palette = createPalette();
      syncCount();
      particles = particles.map(() => spawnParticle(false));
    }

    function onMouseMove(event) {
      pointer.targetXNorm = clamp(event.clientX / Math.max(1, width), 0, 1);
      pointer.active = true;
    }

    function onTouchMove(event) {
      const touch = event.touches[0];
      if (!touch) return;
      pointer.targetXNorm = clamp(touch.clientX / Math.max(1, width), 0, 1);
      pointer.active = true;
    }

    function onLeave() {
      pointer.active = false;
      pointer.targetXNorm = 0.5;
    }

    function animate(now) {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      time += dt;
      syncCount();

      pointer.xNorm += (pointer.targetXNorm - pointer.xNorm) * (pointer.active ? 0.14 : 0.06);
      const mousePush = (pointer.xNorm - 0.5) * clamp(config.mouseInfluence, 0, 4);
      const drift = clamp(config.horizontalDrift, 0, 5);
      const frameScale = dt * 60;

      ctx.fillStyle = config.backgroundColor;
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const wind = Math.sin(time * 0.65 + p.seed) * drift * 0.03;
        const attraction = ((pointer.xNorm * width - p.x) / Math.max(1, width)) * clamp(config.mouseInfluence, 0, 4) * 2.1;
        const targetVx = randomBetween(-drift, drift) * 0.2 + mousePush * 1.15 + attraction;
        p.vx += (targetVx - p.vx) * 0.025 * frameScale;
        p.vx += wind * frameScale;

        p.x += p.vx * frameScale;
        p.y += p.vy * frameScale;

        p.opacity += p.dop * frameScale * 0.35;
        if (p.opacity > 1) {
          p.opacity = 1;
          p.dop *= -1;
        }
        if (p.opacity < 0.2) {
          p.opacity = 0.2;
          p.dop = Math.abs(p.dop);
        }

        if (p.y > height + p.r * 2) {
          particles[i] = spawnParticle(true);
          continue;
        }

        if (p.x < -p.r * 2) p.x = width + p.r;
        else if (p.x > width + p.r * 2) p.x = -p.r;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + p.color.r + ',' + p.color.g + ',' + p.color.b + ',' + clamp(p.opacity, 0, 1) + ')';
        ctx.fill();
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

export const confettiModule: BackgroundModule<ConfettiConfig> = {
  id: 'confetti',
  name: 'Confetti Drift',
  description: 'Colorful floating particles with gentle wind and mouse-driven horizontal flow.',
  defaultConfig,
  configSchema: [
    { id: 'backgroundColor', label: 'Background Color', type: 'color' },
    { id: 'confettiCount', label: 'Confetti Count', type: 'range', options: { min: 20, max: 1200, step: 10 } },
    { id: 'sizeMin', label: 'Size Min', type: 'range', options: { min: 1, max: 10, step: 0.2 } },
    { id: 'sizeMax', label: 'Size Max', type: 'range', options: { min: 2, max: 24, step: 0.2 } },
    { id: 'fallSpeed', label: 'Fall Speed', type: 'range', options: { min: 0.2, max: 6, step: 0.05 } },
    { id: 'horizontalDrift', label: 'Horizontal Drift', type: 'range', options: { min: 0, max: 5, step: 0.05 } },
    { id: 'mouseInfluence', label: 'Mouse Influence', type: 'range', options: { min: 0, max: 4, step: 0.05 } },
    { id: 'fadeSpeed', label: 'Fade Speed', type: 'range', options: { min: 0.005, max: 0.2, step: 0.005 } },
    { id: 'colorA', label: 'Color A', type: 'color' },
    { id: 'colorB', label: 'Color B', type: 'color' },
    { id: 'colorC', label: 'Color C', type: 'color' },
    { id: 'colorD', label: 'Color D', type: 'color' },
    { id: 'colorE', label: 'Color E', type: 'color' },
  ],
  render,
  generateCode,
};
