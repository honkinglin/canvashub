import type { ConfigRecord, ConfigSchemaItem } from '../../types';

export interface DotCountdownConfig extends ConfigRecord {
  backgroundColor: string;
  dotCount: number;
  dotRadius: number;
  sampleGap: number;
  holdTime: number;
  moveEase: number;
  roamAlpha: number;
  formAlpha: number;
  startNumber: number;
  endNumber: number;
  loopCountdown: boolean;
  colorA: string;
  colorB: string;
  colorC: string;
  colorD: string;
}

export const defaultConfig: DotCountdownConfig = {
  backgroundColor: '#24282f',
  dotCount: 2240,
  dotRadius: 2,
  sampleGap: 3,
  holdTime: 1000,
  moveEase: 0.08,
  roamAlpha: 0.3,
  formAlpha: 1,
  startNumber: 10,
  endNumber: 0,
  loopCountdown: true,
  colorA: '#3dcfec',
  colorB: '#fff4ae',
  colorC: '#ffd3da',
  colorD: '#97d3e2',
};

export const dotCountdownConfigSchema: ConfigSchemaItem[] = [
  { id: 'backgroundColor', label: 'Background Color', type: 'color' },
  { id: 'dotCount', label: 'Dot Count', type: 'range', options: { min: 200, max: 5000, step: 20 } },
  { id: 'dotRadius', label: 'Dot Radius', type: 'range', options: { min: 1, max: 6, step: 0.1 } },
  { id: 'sampleGap', label: 'Sample Gap', type: 'range', options: { min: 1, max: 10, step: 1 } },
  { id: 'holdTime', label: 'Step Duration (ms)', type: 'range', options: { min: 200, max: 6000, step: 50 } },
  { id: 'moveEase', label: 'Move Ease', type: 'range', options: { min: 0.01, max: 0.4, step: 0.01 } },
  { id: 'roamAlpha', label: 'Roam Alpha', type: 'range', options: { min: 0.05, max: 1, step: 0.01 } },
  { id: 'formAlpha', label: 'Form Alpha', type: 'range', options: { min: 0.05, max: 1, step: 0.01 } },
  { id: 'startNumber', label: 'Start Number', type: 'range', options: { min: 1, max: 30, step: 1 } },
  { id: 'endNumber', label: 'End Number', type: 'range', options: { min: -20, max: 30, step: 1 } },
  { id: 'loopCountdown', label: 'Loop Countdown', type: 'boolean' },
  { id: 'colorA', label: 'Color A', type: 'color' },
  { id: 'colorB', label: 'Color B', type: 'color' },
  { id: 'colorC', label: 'Color C', type: 'color' },
  { id: 'colorD', label: 'Color D', type: 'color' },
];
