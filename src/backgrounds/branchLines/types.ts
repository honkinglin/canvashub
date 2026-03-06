import type { ConfigRecord, ConfigSchemaItem } from '../../types';

export interface BranchLinesConfig extends ConfigRecord {
  backgroundColor: string;
  minDist: number;
  maxDist: number;
  initialWidth: number;
  maxLines: number;
  initialLines: number;
  speed: number;
  spawnInterval: number;
  spawnChance: number;
  branchChance: number;
  dieChance: number;
  widthDecay: number;
  hueShiftSpeed: number;
  trailFade: number;
  shadowBlur: number;
}

export const defaultConfig: BranchLinesConfig = {
  backgroundColor: '#222222',
  minDist: 10,
  maxDist: 30,
  initialWidth: 10,
  maxLines: 100,
  initialLines: 4,
  speed: 5,
  spawnInterval: 10,
  spawnChance: 0.5,
  branchChance: 0.5,
  dieChance: 0.2,
  widthDecay: 1.25,
  hueShiftSpeed: 1,
  trailFade: 0.02,
  shadowBlur: 0.5,
};

export const branchLinesConfigSchema: ConfigSchemaItem[] = [
  { id: 'backgroundColor', label: 'Background Color', type: 'color' },
  { id: 'minDist', label: 'Min Distance', type: 'range', options: { min: 2, max: 80, step: 1 } },
  { id: 'maxDist', label: 'Max Distance', type: 'range', options: { min: 6, max: 120, step: 1 } },
  { id: 'initialWidth', label: 'Initial Width', type: 'range', options: { min: 1, max: 28, step: 0.2 } },
  { id: 'maxLines', label: 'Max Lines', type: 'range', options: { min: 10, max: 800, step: 1 } },
  { id: 'initialLines', label: 'Initial Lines', type: 'range', options: { min: 1, max: 40, step: 1 } },
  { id: 'speed', label: 'Speed', type: 'range', options: { min: 0.2, max: 20, step: 0.1 } },
  { id: 'spawnInterval', label: 'Spawn Interval', type: 'range', options: { min: 1, max: 80, step: 1 } },
  { id: 'spawnChance', label: 'Spawn Chance', type: 'range', options: { min: 0, max: 1, step: 0.01 } },
  { id: 'branchChance', label: 'Branch Chance', type: 'range', options: { min: 0, max: 1, step: 0.01 } },
  { id: 'dieChance', label: 'Die Chance', type: 'range', options: { min: 0, max: 1, step: 0.01 } },
  { id: 'widthDecay', label: 'Width Decay', type: 'range', options: { min: 1.05, max: 2.5, step: 0.01 } },
  { id: 'hueShiftSpeed', label: 'Hue Shift Speed', type: 'range', options: { min: 0, max: 8, step: 0.05 } },
  { id: 'trailFade', label: 'Trail Fade', type: 'range', options: { min: 0.001, max: 0.25, step: 0.001 } },
  { id: 'shadowBlur', label: 'Shadow Blur', type: 'range', options: { min: 0, max: 8, step: 0.1 } },
];
