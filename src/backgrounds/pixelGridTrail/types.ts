import type { ConfigRecord, ConfigSchemaItem } from '../../types';

export interface PixelGridTrailConfig extends ConfigRecord {
  backgroundColor: string;
  baseCellColor: string;
  gridStep: number;
  cellSize: number;
  color1: string;
  color2: string;
  color3: string;
  color4: string;
  color5: string;
  particleLimit: number;
  spawnPerFrame: number;
  speed: number;
  alphaDecay: number;
  pointerSmoothing: number;
}

export const defaultConfig: PixelGridTrailConfig = {
  backgroundColor: '#111111',
  baseCellColor: '#222222',
  gridStep: 10,
  cellSize: 8,
  color1: '#540045',
  color2: '#C60052',
  color3: '#FF714B',
  color4: '#EAFF87',
  color5: '#ACFFE9',
  particleLimit: 300,
  spawnPerFrame: 2,
  speed: 1.8,
  alphaDecay: 0.008,
  pointerSmoothing: 0.22,
};

export const pixelGridTrailConfigSchema: ConfigSchemaItem[] = [
  { id: 'backgroundColor', label: 'Background Color', type: 'color' },
  { id: 'baseCellColor', label: 'Base Cell Color', type: 'color' },
  { id: 'gridStep', label: 'Grid Step', type: 'range', options: { min: 4, max: 24, step: 1 } },
  { id: 'cellSize', label: 'Cell Size', type: 'range', options: { min: 2, max: 20, step: 1 } },
  { id: 'color1', label: 'Color 1', type: 'color' },
  { id: 'color2', label: 'Color 2', type: 'color' },
  { id: 'color3', label: 'Color 3', type: 'color' },
  { id: 'color4', label: 'Color 4', type: 'color' },
  { id: 'color5', label: 'Color 5', type: 'color' },
  { id: 'particleLimit', label: 'Particle Limit', type: 'range', options: { min: 40, max: 2000, step: 10 } },
  { id: 'spawnPerFrame', label: 'Spawn Per Frame', type: 'range', options: { min: 1, max: 20, step: 1 } },
  { id: 'speed', label: 'Speed', type: 'range', options: { min: 0.1, max: 6, step: 0.05 } },
  { id: 'alphaDecay', label: 'Alpha Decay', type: 'range', options: { min: 0.001, max: 0.06, step: 0.001 } },
  { id: 'pointerSmoothing', label: 'Pointer Smoothing', type: 'range', options: { min: 0.02, max: 0.6, step: 0.01 } },
];
