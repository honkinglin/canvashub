import type { BackgroundModule, CanvasRenderFunction } from '../../types';

export interface WaveConfig {
  waveCount: number;
  amplitude: number;
  frequency: number;
  speed: number;
  color1: string;
  color2: string;
  backgroundColor: string;
}

const defaultConfig: WaveConfig = {
  waveCount: 3,
  amplitude: 60,
  frequency: 0.005,
  speed: 0.05,
  color1: '#3b82f6',
  color2: '#8b5cf6',
  backgroundColor: '#030712'
};

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

const render: CanvasRenderFunction<WaveConfig> = (canvas, ctx, initialConfig) => {
  let config = { ...initialConfig };
  let animationId: number;
  let time = 0;

  const draw = () => {
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, width, height);

    const rgb1 = hexToRgb(config.color1);
    const rgb2 = hexToRgb(config.color2);

    for (let i = 0; i < config.waveCount; i++) {
      ctx.beginPath();
      
      const t = i / (config.waveCount - 1 || 1);
      const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * t);
      const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * t);
      const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * t);
      
      ctx.fillStyle = 'rgba(' + r + ', ' + g + ', ' + b + ', 0.5)';
      
      let startY = height / 2 + (i * 20 - (config.waveCount * 10));

      ctx.moveTo(0, height);
      ctx.lineTo(0, startY);

      for (let x = 0; x <= width; x += 10) {
        // Offset each wave's phase and frequency slightly
        const waveOffset = i * Math.PI * 0.5;
        const currentFreq = config.frequency * (1 + i * 0.1);
        const y = startY + Math.sin(x * currentFreq + time + waveOffset) * config.amplitude;
        ctx.lineTo(x, y);
      }

      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();
    }

    time += config.speed;
    animationId = requestAnimationFrame(draw);
  };

  draw();

  return {
    cleanup: () => cancelAnimationFrame(animationId),
    updateConfig: (newConfig) => {
      config = { ...newConfig };
    }
  };
};

const generateCode = (config: WaveConfig) => `
import React, { useEffect, useRef } from 'react';

const WaveBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const config = ${JSON.stringify(config, null, 2)};
    let time = 0;
    let animationId: number;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.scale(dpr, dpr);
    };
    
    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      // Wave logic implementation...
      time += config.speed;
      animationId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }} />;
};

export default WaveBackground;
`;

export const waveModule: BackgroundModule<WaveConfig> = {
  id: 'waves',
  name: 'Ocean Waves',
  description: 'Smooth, overlapping sine waves creating a calm, oceanic feel.',
  defaultConfig,
  configSchema: [
    { id: 'backgroundColor', label: 'Background Color', type: 'color' },
    { id: 'color1', label: 'Wave Color Start', type: 'color' },
    { id: 'color2', label: 'Wave Color End', type: 'color' },
    { id: 'waveCount', label: 'Wave Count', type: 'range', options: { min: 1, max: 10, step: 1 } },
    { id: 'amplitude', label: 'Amplitude', type: 'range', options: { min: 10, max: 200, step: 5 } },
    { id: 'frequency', label: 'Frequency', type: 'range', options: { min: 0.001, max: 0.05, step: 0.001 } },
    { id: 'speed', label: 'Speed', type: 'range', options: { min: 0.01, max: 0.2, step: 0.01 } },
  ],
  render,
  generateCode
};
