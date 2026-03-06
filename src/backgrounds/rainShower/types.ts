import type { ConfigRecord, ConfigSchemaItem } from '../../types';

export interface RainShowerConfig extends ConfigRecord {
  backgroundColor: string;
  rainColor: string;
  spawnRate: number;
  fallSpeed: number;
  wind: number;
  splashCount: number;
  lineLength: number;
  lineWidth: number;
  maxRain: number;
  maxDrops: number;
  gravity: number;
  dropMaxSpeed: number;
  dropSizeMin: number;
  dropSizeMax: number;
  interaction: boolean;
  pointerWind: number;
  pointerSpawnBoost: number;
}

export const defaultConfig: RainShowerConfig = {
  backgroundColor: '#050b18',
  rainColor: '#50afff',
  spawnRate: 420,
  fallSpeed: 980,
  wind: 70,
  splashCount: 12,
  lineLength: 38,
  lineWidth: 1.6,
  maxRain: 1800,
  maxDrops: 900,
  gravity: 900,
  dropMaxSpeed: 280,
  dropSizeMin: 1,
  dropSizeMax: 3,
  interaction: true,
  pointerWind: 380,
  pointerSpawnBoost: 1.6,
};

export const rainShowerConfigSchema: ConfigSchemaItem[] = [
  { id: 'backgroundColor', label: 'Background Color', type: 'color' },
  { id: 'rainColor', label: 'Rain Color', type: 'color' },
  { id: 'spawnRate', label: 'Spawn Rate', type: 'range', options: { min: 80, max: 1200, step: 10 } },
  { id: 'fallSpeed', label: 'Fall Speed', type: 'range', options: { min: 280, max: 2200, step: 20 } },
  { id: 'wind', label: 'Wind', type: 'range', options: { min: -500, max: 500, step: 5 } },
  { id: 'splashCount', label: 'Splash Count', type: 'range', options: { min: 0, max: 24, step: 1 } },
  { id: 'lineLength', label: 'Line Length', type: 'range', options: { min: 8, max: 72, step: 1 } },
  { id: 'lineWidth', label: 'Line Width', type: 'range', options: { min: 0.4, max: 3.5, step: 0.1 } },
  { id: 'maxRain', label: 'Max Rain', type: 'range', options: { min: 100, max: 3000, step: 50 } },
  { id: 'maxDrops', label: 'Max Drops', type: 'range', options: { min: 100, max: 2000, step: 50 } },
  { id: 'gravity', label: 'Gravity', type: 'range', options: { min: 200, max: 2200, step: 20 } },
  { id: 'dropMaxSpeed', label: 'Drop Max Speed', type: 'range', options: { min: 80, max: 800, step: 10 } },
  { id: 'dropSizeMin', label: 'Drop Size Min', type: 'range', options: { min: 1, max: 4, step: 1 } },
  { id: 'dropSizeMax', label: 'Drop Size Max', type: 'range', options: { min: 1, max: 6, step: 1 } },
  { id: 'interaction', label: 'Interaction', type: 'boolean' },
  { id: 'pointerWind', label: 'Pointer Wind', type: 'range', options: { min: 0, max: 800, step: 5 } },
  { id: 'pointerSpawnBoost', label: 'Pointer Spawn Boost', type: 'range', options: { min: 0, max: 3, step: 0.05 } },
];
