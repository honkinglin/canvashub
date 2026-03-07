import type { ConfigRecord, ConfigSchemaItem } from '../../types';

export interface AmbientFireworksConfig extends ConfigRecord {
  backgroundColor: string;
  fadeAlpha: number;
  autoBurst: boolean;
  autoBurstInterval: number;
  spawnChance: number;
  burstCount: number;
  burstCountJitter: number;
  particleLimit: number;
  speedMin: number;
  speedMax: number;
  gravity: number;
  alphaDecay: number;
  particleSizeMin: number;
  particleSizeMax: number;
  burstMargin: number;
  colorMode: string;
  particleColor: string;
  clickBurst: boolean;
}

export const defaultConfig: AmbientFireworksConfig = {
  backgroundColor: '#020611',
  fadeAlpha: 0.2,
  autoBurst: true,
  autoBurstInterval: 420,
  spawnChance: 0.04,
  burstCount: 120,
  burstCountJitter: 50,
  particleLimit: 1400,
  speedMin: 120,
  speedMax: 320,
  gravity: 180,
  alphaDecay: 0.58,
  particleSizeMin: 1.2,
  particleSizeMax: 4,
  burstMargin: 100,
  colorMode: 'random',
  particleColor: '#88ccff',
  clickBurst: true,
};

export const ambientFireworksConfigSchema: ConfigSchemaItem[] = [
  { id: 'backgroundColor', label: 'Background Color', type: 'color' },
  { id: 'fadeAlpha', label: 'Fade Alpha', type: 'range', options: { min: 0.02, max: 0.7, step: 0.01 } },
  { id: 'autoBurst', label: 'Auto Burst', type: 'boolean' },
  { id: 'autoBurstInterval', label: 'Auto Burst Interval', type: 'range', options: { min: 80, max: 2000, step: 10 } },
  { id: 'spawnChance', label: 'Spawn Chance', type: 'range', options: { min: 0, max: 0.2, step: 0.005 } },
  { id: 'burstCount', label: 'Burst Count', type: 'range', options: { min: 20, max: 260, step: 1 } },
  { id: 'burstCountJitter', label: 'Burst Count Jitter', type: 'range', options: { min: 0, max: 200, step: 1 } },
  { id: 'particleLimit', label: 'Particle Limit', type: 'range', options: { min: 120, max: 4000, step: 20 } },
  { id: 'speedMin', label: 'Speed Min', type: 'range', options: { min: 20, max: 600, step: 5 } },
  { id: 'speedMax', label: 'Speed Max', type: 'range', options: { min: 40, max: 900, step: 5 } },
  { id: 'gravity', label: 'Gravity', type: 'range', options: { min: 0, max: 1200, step: 10 } },
  { id: 'alphaDecay', label: 'Alpha Decay', type: 'range', options: { min: 0.08, max: 1.8, step: 0.01 } },
  { id: 'particleSizeMin', label: 'Particle Size Min', type: 'range', options: { min: 0.4, max: 6, step: 0.1 } },
  { id: 'particleSizeMax', label: 'Particle Size Max', type: 'range', options: { min: 0.6, max: 10, step: 0.1 } },
  { id: 'burstMargin', label: 'Burst Margin', type: 'range', options: { min: 0, max: 300, step: 1 } },
  {
    id: 'colorMode',
    label: 'Color Mode',
    type: 'select',
    options: { options: ['random', 'fixed'] },
  },
  { id: 'particleColor', label: 'Particle Color', type: 'color' },
  { id: 'clickBurst', label: 'Click Burst', type: 'boolean' },
];
