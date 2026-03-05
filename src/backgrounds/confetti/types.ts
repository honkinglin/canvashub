import type { ConfigRecord, ConfigSchemaItem } from '../../types';

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

export const defaultConfig: ConfettiConfig = {
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

export const confettiConfigSchema: ConfigSchemaItem[] = [
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
];
