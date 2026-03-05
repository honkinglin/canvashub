import type { ConfigRecord, ConfigSchemaItem } from '../../types';

export interface GradientConfig extends ConfigRecord {
  color1: string;
  color2: string;
  color3: string;
  speed: number;
  scale: number;
}

export const defaultConfig: GradientConfig = {
  color1: '#ff4b8b',
  color2: '#6366f1',
  color3: '#0ea5e9',
  speed: 1,
  scale: 1,
};

export const gradientConfigSchema: ConfigSchemaItem[] = [
  { id: 'color1', label: 'Color 1', type: 'color' },
  { id: 'color2', label: 'Color 2', type: 'color' },
  { id: 'color3', label: 'Color 3', type: 'color' },
  { id: 'speed', label: 'Speed', type: 'range', options: { min: 0.1, max: 5, step: 0.1 } },
  { id: 'scale', label: 'Scale', type: 'range', options: { min: 0.5, max: 2, step: 0.1 } },
];
