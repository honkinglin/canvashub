import type { ConfigRecord, ConfigSchemaItem } from '../../types';

export interface BubbleBounceConfig extends ConfigRecord {
  backgroundColor: string;
  circleCount: number;
  radiusMin: number;
  radiusMax: number;
  speed: number;
  strokeWidth: number;
  trailAlpha: number;
  bounceLoss: number;
  colorA: string;
  colorB: string;
  colorC: string;
  colorD: string;
  colorE: string;
}

export const defaultConfig: BubbleBounceConfig = {
  backgroundColor: '#041325',
  circleCount: 80,
  radiusMin: 6,
  radiusMax: 30,
  speed: 1,
  strokeWidth: 2,
  trailAlpha: 1,
  bounceLoss: 1,
  colorA: '#14427F',
  colorB: '#75B0FF',
  colorC: '#2885FF',
  colorD: '#3A587F',
  colorE: '#206ACC',
};

export const bubbleBounceConfigSchema: ConfigSchemaItem[] = [
  { id: 'backgroundColor', label: 'Background Color', type: 'color' },
  { id: 'circleCount', label: 'Circle Count', type: 'range', options: { min: 10, max: 300, step: 1 } },
  { id: 'radiusMin', label: 'Radius Min', type: 'range', options: { min: 2, max: 80, step: 1 } },
  { id: 'radiusMax', label: 'Radius Max', type: 'range', options: { min: 4, max: 140, step: 1 } },
  { id: 'speed', label: 'Speed', type: 'range', options: { min: 0.1, max: 8, step: 0.1 } },
  { id: 'strokeWidth', label: 'Stroke Width', type: 'range', options: { min: 0.5, max: 8, step: 0.1 } },
  { id: 'trailAlpha', label: 'Trail Alpha', type: 'range', options: { min: 0.02, max: 1, step: 0.01 } },
  { id: 'bounceLoss', label: 'Bounce Loss', type: 'range', options: { min: 0.8, max: 1, step: 0.005 } },
  { id: 'colorA', label: 'Color A', type: 'color' },
  { id: 'colorB', label: 'Color B', type: 'color' },
  { id: 'colorC', label: 'Color C', type: 'color' },
  { id: 'colorD', label: 'Color D', type: 'color' },
  { id: 'colorE', label: 'Color E', type: 'color' },
];
