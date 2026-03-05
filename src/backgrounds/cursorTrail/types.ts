import type { ConfigRecord, ConfigSchemaItem } from '../../types';

export interface CursorTrailConfig extends ConfigRecord {
  backgroundColor: string;
  particleColor: string;
  particleCount: number;
  maxVelocity: number;
  mouseRadius: number;
  mouseStrength: number;
  trailAlpha: number;
  pointSize: number;
  jitter: number;
}

export const defaultConfig: CursorTrailConfig = {
  backgroundColor: '#0a0a0a',
  particleColor: '#ffffff',
  particleCount: 1500,
  maxVelocity: 1.5,
  mouseRadius: 150,
  mouseStrength: 0.5,
  trailAlpha: 0.15,
  pointSize: 0.8,
  jitter: 0.05,
};

export const cursorTrailConfigSchema: ConfigSchemaItem[] = [
  { id: 'backgroundColor', label: 'Background Color', type: 'color' },
  { id: 'particleColor', label: 'Particle Color', type: 'color' },
  { id: 'particleCount', label: 'Particle Count', type: 'range', options: { min: 100, max: 5000, step: 20 } },
  { id: 'maxVelocity', label: 'Max Velocity', type: 'range', options: { min: 0.2, max: 5, step: 0.05 } },
  { id: 'mouseRadius', label: 'Mouse Radius', type: 'range', options: { min: 20, max: 600, step: 5 } },
  { id: 'mouseStrength', label: 'Mouse Strength', type: 'range', options: { min: 0, max: 2.5, step: 0.01 } },
  { id: 'trailAlpha', label: 'Trail Alpha', type: 'range', options: { min: 0.01, max: 0.95, step: 0.01 } },
  { id: 'pointSize', label: 'Point Size', type: 'range', options: { min: 0.2, max: 4, step: 0.05 } },
  { id: 'jitter', label: 'Jitter', type: 'range', options: { min: 0, max: 0.3, step: 0.005 } },
];
