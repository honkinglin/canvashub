import type { ConfigRecord, ConfigSchemaItem } from '../../types';

export interface OrbitTrailsConfig extends ConfigRecord {
  backgroundColor: string;
  particleCount: number;
  orbitRadius: number;
  orbitScaleMax: number;
  trailAlpha: number;
  speedMin: number;
  speedMax: number;
  sizeMin: number;
  sizeMax: number;
  hueMin: number;
  hueMax: number;
  pressBoost: boolean;
}

export const defaultConfig: OrbitTrailsConfig = {
  backgroundColor: '#000000',
  particleCount: 25,
  orbitRadius: 70,
  orbitScaleMax: 1.5,
  trailAlpha: 0.05,
  speedMin: 0.01,
  speedMax: 0.05,
  sizeMin: 1,
  sizeMax: 8,
  hueMin: 0,
  hueMax: 360,
  pressBoost: true,
};

export const orbitTrailsConfigSchema: ConfigSchemaItem[] = [
  { id: 'backgroundColor', label: 'Background Color', type: 'color' },
  { id: 'particleCount', label: 'Particle Count', type: 'range', options: { min: 8, max: 120, step: 1 } },
  { id: 'orbitRadius', label: 'Orbit Radius', type: 'range', options: { min: 10, max: 220, step: 1 } },
  { id: 'orbitScaleMax', label: 'Orbit Scale Max', type: 'range', options: { min: 1, max: 3, step: 0.01 } },
  { id: 'trailAlpha', label: 'Trail Alpha', type: 'range', options: { min: 0.01, max: 0.3, step: 0.005 } },
  { id: 'speedMin', label: 'Speed Min', type: 'range', options: { min: 0.005, max: 0.12, step: 0.001 } },
  { id: 'speedMax', label: 'Speed Max', type: 'range', options: { min: 0.01, max: 0.2, step: 0.001 } },
  { id: 'sizeMin', label: 'Size Min', type: 'range', options: { min: 0.5, max: 8, step: 0.1 } },
  { id: 'sizeMax', label: 'Size Max', type: 'range', options: { min: 1, max: 16, step: 0.1 } },
  { id: 'hueMin', label: 'Hue Min', type: 'range', options: { min: 0, max: 360, step: 1 } },
  { id: 'hueMax', label: 'Hue Max', type: 'range', options: { min: 0, max: 360, step: 1 } },
  { id: 'pressBoost', label: 'Press Boost', type: 'boolean' },
];
