import type { BackgroundModule, CanvasRenderFunction, ConfigRecord } from '../../types';

export interface ParticleConfig extends ConfigRecord {
  particleCount: number;
  speed: number;
  connectionDistance: number;
  color: string;
  backgroundColor: string;
}

const defaultConfig: ParticleConfig = {
  particleCount: 100,
  speed: 1.5,
  connectionDistance: 120,
  color: '#3b82f6',
  backgroundColor: '#030712'
};

class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;

  constructor(width: number, height: number, speed: number) {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    const angle = Math.random() * Math.PI * 2;
    this.vx = Math.cos(angle) * speed * (Math.random() * 0.5 + 0.5);
    this.vy = Math.sin(angle) * speed * (Math.random() * 0.5 + 0.5);
    this.radius = Math.random() * 2 + 1;
  }

  update(width: number, height: number) {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 || this.x > width) this.vx *= -1;
    if (this.y < 0 || this.y > height) this.vy *= -1;
  }

  draw(ctx: CanvasRenderingContext2D, color: string) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }
}

const render: CanvasRenderFunction<ParticleConfig> = (canvas, ctx, initialConfig) => {
  let config = { ...initialConfig };
  let animationId: number;
  let particles: Particle[] = [];
  let width = canvas.width;
  let height = canvas.height;

  const initParticles = () => {
    particles = [];
    const dpr = window.devicePixelRatio || 1;
    width = canvas.width / dpr;
    height = canvas.height / dpr;
    for (let i = 0; i < config.particleCount; i++) {
      particles.push(new Particle(width, height, config.speed));
    }
  };

  const draw = () => {
    const dpr = window.devicePixelRatio || 1;
    width = canvas.width / dpr;
    height = canvas.height / dpr;

    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Adjust particle count dynamically
    while (particles.length < config.particleCount) {
      particles.push(new Particle(width, height, config.speed));
    }
    if (particles.length > config.particleCount) {
      particles.length = config.particleCount;
    }

    // Update speed dynamically
    particles.forEach(p => {
      const currentSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (Math.abs(currentSpeed - config.speed) > 0.1) {
        const ratio = config.speed / (currentSpeed || 1);
        p.vx *= ratio;
        p.vy *= ratio;
      }
    });

    for (let i = 0; i < particles.length; i++) {
      particles[i].update(width, height);
      particles[i].draw(ctx, config.color);

      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < config.connectionDistance) {
          ctx.beginPath();
          ctx.strokeStyle = `${config.color}${Math.floor((1 - dist / config.connectionDistance) * 255).toString(16).padStart(2, '0')}`;
          ctx.lineWidth = 1;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    animationId = requestAnimationFrame(draw);
  };

  initParticles();
  draw();

  return {
    cleanup: () => {
      cancelAnimationFrame(animationId);
    },
    updateConfig: (newConfig) => {
      config = { ...newConfig };
    }
  };
};

const generateCode = (config: ParticleConfig) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Network Particles</title>
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

    let width = 0;
    let height = 0;
    const particles = [];

    class Particle {
      constructor() {
        const angle = Math.random() * Math.PI * 2;
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = Math.cos(angle) * config.speed * (Math.random() * 0.5 + 0.5);
        this.vy = Math.sin(angle) * config.speed * (Math.random() * 0.5 + 0.5);
        this.radius = Math.random() * 2 + 1;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
      }
    }

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

    function syncParticleCount() {
      while (particles.length < config.particleCount) particles.push(new Particle());
      if (particles.length > config.particleCount) particles.length = config.particleCount;
    }

    function draw() {
      ctx.fillStyle = config.backgroundColor;
      ctx.fillRect(0, 0, width, height);

      syncParticleCount();

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        const currentSpeed = Math.hypot(p1.vx, p1.vy) || 1;
        const scale = config.speed / currentSpeed;
        p1.vx *= 0.98 + scale * 0.02;
        p1.vy *= 0.98 + scale * 0.02;

        p1.update();
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
        ctx.fillStyle = config.color;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.hypot(dx, dy);
          if (dist < config.connectionDistance) {
            const alpha = 1 - dist / config.connectionDistance;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = config.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(draw);
    }

    resize();
    syncParticleCount();
    draw();
    window.addEventListener('resize', resize);
  </script>
</body>
</html>
`;

export const particleModule: BackgroundModule<ParticleConfig> = {
  id: 'particles',
  name: 'Network Particles',
  description: 'Interactive connecting particles forming a geometric network.',
  defaultConfig,
  configSchema: [
    { id: 'backgroundColor', label: 'Background Color', type: 'color' },
    { id: 'color', label: 'Particle Color', type: 'color' },
    { id: 'particleCount', label: 'Particle Count', type: 'range', options: { min: 20, max: 300, step: 1 } },
    { id: 'connectionDistance', label: 'Connection Distance', type: 'range', options: { min: 50, max: 300, step: 10 } },
    { id: 'speed', label: 'Speed', type: 'range', options: { min: 0.1, max: 5, step: 0.1 } },
  ],
  render,
  generateCode
};
