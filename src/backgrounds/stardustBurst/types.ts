import type { ConfigRecord, ConfigSchemaItem } from '../../types';

export interface StardustBurstConfig extends ConfigRecord {
  backgroundColor: string;
  particleCount: number;
  maxParticleSize: number;
  maxSpeed: number;
  colorVariation: number;
  backgroundFade: number;
  friction: number;
  gravity: number;
  autoBurst: boolean;
  autoBurstInterval: number;
  colorA: string;
  colorB: string;
  colorC: string;
  colorD: string;
}

export const defaultConfig: StardustBurstConfig = {
  backgroundColor: '#0c091d',
  particleCount: 800,
  maxParticleSize: 10,
  maxSpeed: 40,
  colorVariation: 50,
  backgroundFade: 1,
  friction: 0.965,
  gravity: 0.06,
  autoBurst: true,
  autoBurstInterval: 1200,
  colorA: '#24122A',
  colorB: '#4E242A',
  colorC: '#FCB260',
  colorD: '#FDEE98',
};

export const stardustBurstConfigSchema: ConfigSchemaItem[] = [
  { id: 'backgroundColor', label: 'Background Color', type: 'color' },
  { id: 'particleCount', label: 'Particle Count', type: 'range', options: { min: 80, max: 1800, step: 10 } },
  { id: 'maxParticleSize', label: 'Max Particle Size', type: 'range', options: { min: 1, max: 20, step: 0.2 } },
  { id: 'maxSpeed', label: 'Max Speed', type: 'range', options: { min: 4, max: 80, step: 0.5 } },
  { id: 'colorVariation', label: 'Color Variation', type: 'range', options: { min: 0, max: 140, step: 1 } },
  { id: 'backgroundFade', label: 'Background Fade', type: 'range', options: { min: 0.04, max: 1, step: 0.01 } },
  { id: 'friction', label: 'Friction', type: 'range', options: { min: 0.85, max: 0.999, step: 0.001 } },
  { id: 'gravity', label: 'Gravity', type: 'range', options: { min: -0.2, max: 0.4, step: 0.005 } },
  { id: 'autoBurst', label: 'Auto Burst', type: 'boolean' },
  { id: 'autoBurstInterval', label: 'Auto Burst Interval', type: 'range', options: { min: 200, max: 4000, step: 50 } },
  { id: 'colorA', label: 'Color A', type: 'color' },
  { id: 'colorB', label: 'Color B', type: 'color' },
  { id: 'colorC', label: 'Color C', type: 'color' },
  { id: 'colorD', label: 'Color D', type: 'color' },
];
