import type { ConfigRecord, ConfigSchemaItem } from '../../types';

export interface SnowDriftConfig extends ConfigRecord {
  backgroundColor: string;
  snowColor: string;
  fadeAlpha: number;
  density: number;
  particleLimit: number;
  sizeMin: number;
  sizeMax: number;
  speedMin: number;
  speedMax: number;
  driftMin: number;
  driftMax: number;
  swayAmount: number;
  wind: number;
  interaction: boolean;
  pointerWind: number;
}

export const defaultConfig: SnowDriftConfig = {
  backgroundColor: '#0a1020',
  snowColor: '#f6f9fa',
  fadeAlpha: 1,
  density: 1.2,
  particleLimit: 1800,
  sizeMin: 1.2,
  sizeMax: 5,
  speedMin: 30,
  speedMax: 90,
  driftMin: -18,
  driftMax: 18,
  swayAmount: 14,
  wind: 0,
  interaction: true,
  pointerWind: 90,
};

export const snowDriftConfigSchema: ConfigSchemaItem[] = [
  { id: 'backgroundColor', label: 'Background Color', type: 'color' },
  { id: 'snowColor', label: 'Snow Color', type: 'color' },
  { id: 'fadeAlpha', label: 'Fade Alpha', type: 'range', options: { min: 0.08, max: 1, step: 0.01 } },
  { id: 'density', label: 'Density', type: 'range', options: { min: 0.2, max: 4, step: 0.05 } },
  { id: 'particleLimit', label: 'Particle Limit', type: 'range', options: { min: 60, max: 4000, step: 20 } },
  { id: 'sizeMin', label: 'Size Min', type: 'range', options: { min: 0.4, max: 8, step: 0.1 } },
  { id: 'sizeMax', label: 'Size Max', type: 'range', options: { min: 0.6, max: 12, step: 0.1 } },
  { id: 'speedMin', label: 'Speed Min', type: 'range', options: { min: 5, max: 200, step: 1 } },
  { id: 'speedMax', label: 'Speed Max', type: 'range', options: { min: 10, max: 320, step: 1 } },
  { id: 'driftMin', label: 'Drift Min', type: 'range', options: { min: -200, max: 0, step: 1 } },
  { id: 'driftMax', label: 'Drift Max', type: 'range', options: { min: 0, max: 200, step: 1 } },
  { id: 'swayAmount', label: 'Sway Amount', type: 'range', options: { min: 0, max: 80, step: 1 } },
  { id: 'wind', label: 'Wind', type: 'range', options: { min: -300, max: 300, step: 1 } },
  { id: 'interaction', label: 'Interaction', type: 'boolean' },
  { id: 'pointerWind', label: 'Pointer Wind', type: 'range', options: { min: 0, max: 300, step: 1 } },
];
