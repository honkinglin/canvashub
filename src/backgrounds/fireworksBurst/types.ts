import type { ConfigRecord, ConfigSchemaItem } from '../../types';

export interface FireworksBurstConfig extends ConfigRecord {
  backgroundColor: string;
  particleCount: number;
  particleRadiusMin: number;
  particleRadiusMax: number;
  spreadMin: number;
  spreadMax: number;
  durationMin: number;
  durationMax: number;
  ringRadiusMin: number;
  ringRadiusMax: number;
  ringLineWidth: number;
  fadeAlpha: number;
  autoBurst: boolean;
  autoBurstInterval: number;
  autoBurstJitter: number;
  stopAutoOnInteract: boolean;
  colorA: string;
  colorB: string;
  colorC: string;
  colorD: string;
}

export const defaultConfig: FireworksBurstConfig = {
  backgroundColor: '#0d0a1f',
  particleCount: 30,
  particleRadiusMin: 8,
  particleRadiusMax: 18,
  spreadMin: 50,
  spreadMax: 180,
  durationMin: 1200,
  durationMax: 1800,
  ringRadiusMin: 80,
  ringRadiusMax: 160,
  ringLineWidth: 6,
  fadeAlpha: 1,
  autoBurst: true,
  autoBurstInterval: 260,
  autoBurstJitter: 50,
  stopAutoOnInteract: true,
  colorA: '#FF1461',
  colorB: '#18FF92',
  colorC: '#5A87FF',
  colorD: '#FBF38C',
};

export const fireworksBurstConfigSchema: ConfigSchemaItem[] = [
  { id: 'backgroundColor', label: 'Background Color', type: 'color' },
  { id: 'particleCount', label: 'Particle Count', type: 'range', options: { min: 8, max: 120, step: 1 } },
  { id: 'particleRadiusMin', label: 'Particle Radius Min', type: 'range', options: { min: 1, max: 30, step: 0.2 } },
  { id: 'particleRadiusMax', label: 'Particle Radius Max', type: 'range', options: { min: 2, max: 48, step: 0.2 } },
  { id: 'spreadMin', label: 'Spread Min', type: 'range', options: { min: 10, max: 220, step: 1 } },
  { id: 'spreadMax', label: 'Spread Max', type: 'range', options: { min: 30, max: 320, step: 1 } },
  { id: 'durationMin', label: 'Duration Min', type: 'range', options: { min: 200, max: 2400, step: 10 } },
  { id: 'durationMax', label: 'Duration Max', type: 'range', options: { min: 300, max: 3000, step: 10 } },
  { id: 'ringRadiusMin', label: 'Ring Radius Min', type: 'range', options: { min: 20, max: 260, step: 1 } },
  { id: 'ringRadiusMax', label: 'Ring Radius Max', type: 'range', options: { min: 30, max: 360, step: 1 } },
  { id: 'ringLineWidth', label: 'Ring Line Width', type: 'range', options: { min: 0.5, max: 16, step: 0.1 } },
  { id: 'fadeAlpha', label: 'Fade Alpha', type: 'range', options: { min: 0.02, max: 1, step: 0.01 } },
  { id: 'autoBurst', label: 'Auto Burst', type: 'boolean' },
  { id: 'autoBurstInterval', label: 'Auto Burst Interval', type: 'range', options: { min: 80, max: 2000, step: 10 } },
  { id: 'autoBurstJitter', label: 'Auto Burst Jitter', type: 'range', options: { min: 0, max: 300, step: 1 } },
  { id: 'stopAutoOnInteract', label: 'Stop Auto On Interact', type: 'boolean' },
  { id: 'colorA', label: 'Color A', type: 'color' },
  { id: 'colorB', label: 'Color B', type: 'color' },
  { id: 'colorC', label: 'Color C', type: 'color' },
  { id: 'colorD', label: 'Color D', type: 'color' },
];
