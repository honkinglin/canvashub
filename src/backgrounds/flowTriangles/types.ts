import type { ConfigRecord, ConfigSchemaItem } from '../../types';

export interface FlowTrianglesConfig extends ConfigRecord {
  backgroundColor: string;
  particleCount: number;
  cellSize: number;
  forceStrength: number;
  noiseScale: number;
  timeScale: number;
  spawnPerFrame: number;
  emitterLerp: number;
  particleDrag: number;
  alphaDecay: number;
  triangleSpread: number;
  hueSaturation: number;
  lightnessMin: number;
  lightnessMax: number;
}

export const defaultConfig: FlowTrianglesConfig = {
  backgroundColor: '#ffffff',
  particleCount: 250,
  cellSize: 20,
  forceStrength: 0.1,
  noiseScale: 0.08,
  timeScale: 0.55,
  spawnPerFrame: 2,
  emitterLerp: 0.2,
  particleDrag: 0.992,
  alphaDecay: 0.008,
  triangleSpread: 10,
  hueSaturation: 40,
  lightnessMin: 60,
  lightnessMax: 80,
};

export const flowTrianglesConfigSchema: ConfigSchemaItem[] = [
  { id: 'backgroundColor', label: 'Background Color', type: 'color' },
  { id: 'particleCount', label: 'Particle Count', type: 'range', options: { min: 50, max: 2500, step: 10 } },
  { id: 'cellSize', label: 'Cell Size', type: 'range', options: { min: 8, max: 64, step: 1 } },
  { id: 'forceStrength', label: 'Force Strength', type: 'range', options: { min: 0.01, max: 1, step: 0.01 } },
  { id: 'noiseScale', label: 'Noise Scale', type: 'range', options: { min: 0.01, max: 0.5, step: 0.005 } },
  { id: 'timeScale', label: 'Time Scale', type: 'range', options: { min: 0.05, max: 3, step: 0.01 } },
  { id: 'spawnPerFrame', label: 'Spawn Per Frame', type: 'range', options: { min: 1, max: 30, step: 1 } },
  { id: 'emitterLerp', label: 'Emitter Lerp', type: 'range', options: { min: 0.01, max: 0.8, step: 0.01 } },
  { id: 'particleDrag', label: 'Particle Drag', type: 'range', options: { min: 0.8, max: 1, step: 0.001 } },
  { id: 'alphaDecay', label: 'Alpha Decay', type: 'range', options: { min: 0.001, max: 0.05, step: 0.001 } },
  { id: 'triangleSpread', label: 'Triangle Spread', type: 'range', options: { min: 2, max: 40, step: 1 } },
  { id: 'hueSaturation', label: 'Hue Saturation', type: 'range', options: { min: 0, max: 100, step: 1 } },
  { id: 'lightnessMin', label: 'Lightness Min', type: 'range', options: { min: 10, max: 90, step: 1 } },
  { id: 'lightnessMax', label: 'Lightness Max', type: 'range', options: { min: 20, max: 100, step: 1 } },
];
