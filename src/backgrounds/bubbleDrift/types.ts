import type { ConfigRecord, ConfigSchemaItem } from '../../types';

export interface BubbleDriftConfig extends ConfigRecord {
  backgroundColor: string;
  bubbleCount: number;
  radiusMin: number;
  radiusMax: number;
  speedMin: number;
  speedMax: number;
  opacityMin: number;
  opacityMax: number;
  repelRadius: number;
  repelStrength: number;
  drift: number;
  colorCore: string;
  colorMid: string;
  colorEdge: string;
  outlineAlpha: number;
}

export const defaultConfig: BubbleDriftConfig = {
  backgroundColor: '#020b16',
  bubbleCount: 80,
  radiusMin: 10,
  radiusMax: 30,
  speedMin: 0.5,
  speedMax: 3,
  opacityMin: 0.2,
  opacityMax: 0.6,
  repelRadius: 300,
  repelStrength: 5,
  drift: 0.7,
  colorCore: '#ffffff',
  colorMid: '#add8e6',
  colorEdge: '#0064a0',
  outlineAlpha: 0.5,
};

export const bubbleDriftConfigSchema: ConfigSchemaItem[] = [
  { id: 'backgroundColor', label: 'Background Color', type: 'color' },
  { id: 'bubbleCount', label: 'Bubble Count', type: 'range', options: { min: 10, max: 300, step: 1 } },
  { id: 'radiusMin', label: 'Radius Min', type: 'range', options: { min: 2, max: 80, step: 1 } },
  { id: 'radiusMax', label: 'Radius Max', type: 'range', options: { min: 4, max: 120, step: 1 } },
  { id: 'speedMin', label: 'Speed Min', type: 'range', options: { min: 0.1, max: 10, step: 0.1 } },
  { id: 'speedMax', label: 'Speed Max', type: 'range', options: { min: 0.2, max: 15, step: 0.1 } },
  { id: 'opacityMin', label: 'Min Opacity', type: 'range', options: { min: 0.05, max: 1, step: 0.01 } },
  { id: 'opacityMax', label: 'Max Opacity', type: 'range', options: { min: 0.05, max: 1, step: 0.01 } },
  { id: 'repelRadius', label: 'Repel Radius', type: 'range', options: { min: 10, max: 800, step: 1 } },
  { id: 'repelStrength', label: 'Repel Strength', type: 'range', options: { min: 0.1, max: 20, step: 0.1 } },
  { id: 'drift', label: 'Drift', type: 'range', options: { min: 0, max: 8, step: 0.05 } },
  { id: 'colorCore', label: 'Core Color', type: 'color' },
  { id: 'colorMid', label: 'Mid Color', type: 'color' },
  { id: 'colorEdge', label: 'Edge Color', type: 'color' },
  { id: 'outlineAlpha', label: 'Outline Alpha', type: 'range', options: { min: 0, max: 1, step: 0.01 } },
];
