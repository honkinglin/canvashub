import type { ConfigRecord, ConfigSchemaItem } from '../../types';

export interface MagicDustConfig extends ConfigRecord {
  backgroundColor: string;
  ambientCount: number;
  burstCount: number;
  sizeMin: number;
  sizeMax: number;
  speedMin: number;
  speedMax: number;
  lifeMin: number;
  lifeMax: number;
  gravity: number;
  trailFade: number;
  spawnInterval: number;
  glowStrength: number;
  colorA: string;
  colorB: string;
  colorC: string;
}

export const defaultConfig: MagicDustConfig = {
  backgroundColor: '#0f1724',
  ambientCount: 260,
  burstCount: 5,
  sizeMin: 8,
  sizeMax: 38,
  speedMin: 1,
  speedMax: 9,
  lifeMin: 1.2,
  lifeMax: 4.5,
  gravity: 0.08,
  trailFade: 0.22,
  spawnInterval: 18,
  glowStrength: 1,
  colorA: '#b1fffc',
  colorB: '#ca4cff',
  colorC: '#66dbd6',
};

export const magicDustConfigSchema: ConfigSchemaItem[] = [
  { id: 'backgroundColor', label: 'Background Color', type: 'color' },
  { id: 'ambientCount', label: 'Ambient Count', type: 'range', options: { min: 0, max: 1800, step: 10 } },
  { id: 'burstCount', label: 'Burst Count', type: 'range', options: { min: 1, max: 40, step: 1 } },
  { id: 'sizeMin', label: 'Size Min', type: 'range', options: { min: 2, max: 80, step: 1 } },
  { id: 'sizeMax', label: 'Size Max', type: 'range', options: { min: 6, max: 140, step: 1 } },
  { id: 'speedMin', label: 'Speed Min', type: 'range', options: { min: 0.1, max: 20, step: 0.1 } },
  { id: 'speedMax', label: 'Speed Max', type: 'range', options: { min: 0.5, max: 40, step: 0.1 } },
  { id: 'lifeMin', label: 'Life Min', type: 'range', options: { min: 0.2, max: 8, step: 0.1 } },
  { id: 'lifeMax', label: 'Life Max', type: 'range', options: { min: 0.4, max: 14, step: 0.1 } },
  { id: 'gravity', label: 'Gravity', type: 'range', options: { min: -1, max: 2, step: 0.01 } },
  { id: 'trailFade', label: 'Trail Fade', type: 'range', options: { min: 0.02, max: 1, step: 0.01 } },
  { id: 'spawnInterval', label: 'Spawn Interval', type: 'range', options: { min: 4, max: 120, step: 1 } },
  { id: 'glowStrength', label: 'Glow Strength', type: 'range', options: { min: 0.1, max: 3, step: 0.05 } },
  { id: 'colorA', label: 'Color A', type: 'color' },
  { id: 'colorB', label: 'Color B', type: 'color' },
  { id: 'colorC', label: 'Color C', type: 'color' },
];
