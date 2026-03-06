import type { ConfigRecord, ConfigSchemaItem } from '../../types';

export interface StarfieldWarpConfig extends ConfigRecord {
  backgroundColor: string;
  starColor: string;
  starCount: number;
  focalLength: number;
  baseSpeed: number;
  warpEnabled: boolean;
  warpSpeed: number;
  trailFade: number;
  maxDepth: number;
  starSize: number;
  minOpacity: number;
  maxOpacity: number;
}

export const defaultConfig: StarfieldWarpConfig = {
  backgroundColor: '#000a14',
  starColor: '#d1ffff',
  starCount: 1500,
  focalLength: 2,
  baseSpeed: 1,
  warpEnabled: false,
  warpSpeed: 4,
  trailFade: 0.18,
  maxDepth: 1,
  starSize: 1,
  minOpacity: 0.1,
  maxOpacity: 1,
};

export const starfieldWarpConfigSchema: ConfigSchemaItem[] = [
  { id: 'backgroundColor', label: 'Background Color', type: 'color' },
  { id: 'starColor', label: 'Star Color', type: 'color' },
  { id: 'starCount', label: 'Star Count', type: 'range', options: { min: 100, max: 5000, step: 50 } },
  { id: 'focalLength', label: 'Focal Length', type: 'range', options: { min: 0.8, max: 6, step: 0.05 } },
  { id: 'baseSpeed', label: 'Base Speed', type: 'range', options: { min: 0.1, max: 6, step: 0.05 } },
  { id: 'warpEnabled', label: 'Warp Enabled', type: 'boolean' },
  { id: 'warpSpeed', label: 'Warp Speed', type: 'range', options: { min: 1, max: 20, step: 0.1 } },
  { id: 'trailFade', label: 'Trail Fade', type: 'range', options: { min: 0.01, max: 1, step: 0.01 } },
  { id: 'maxDepth', label: 'Max Depth', type: 'range', options: { min: 0.4, max: 3, step: 0.05 } },
  { id: 'starSize', label: 'Star Size', type: 'range', options: { min: 0.2, max: 3, step: 0.05 } },
  { id: 'minOpacity', label: 'Min Opacity', type: 'range', options: { min: 0.01, max: 0.9, step: 0.01 } },
  { id: 'maxOpacity', label: 'Max Opacity', type: 'range', options: { min: 0.1, max: 1, step: 0.01 } },
];
