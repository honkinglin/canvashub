import type { ConfigRecord, ConfigSchemaItem } from '../../types';

export interface ClassicFireworksConfig extends ConfigRecord {
  backgroundColor: string;
  trailFade: number;
  hueShiftSpeed: number;
  autoLaunchInterval: number;
  holdLaunchInterval: number;
  rocketStartSpeed: number;
  rocketAcceleration: number;
  rocketTrailLength: number;
  particleCount: number;
  particleSpeedMin: number;
  particleSpeedMax: number;
  particleFriction: number;
  particleGravity: number;
  particleDecayMin: number;
  particleDecayMax: number;
  particleTrailLength: number;
}

export const defaultConfig: ClassicFireworksConfig = {
  backgroundColor: '#000000',
  trailFade: 0.45,
  hueShiftSpeed: 24,
  autoLaunchInterval: 1100,
  holdLaunchInterval: 110,
  rocketStartSpeed: 2,
  rocketAcceleration: 1.05,
  rocketTrailLength: 3,
  particleCount: 30,
  particleSpeedMin: 1,
  particleSpeedMax: 10,
  particleFriction: 0.95,
  particleGravity: 1,
  particleDecayMin: 0.015,
  particleDecayMax: 0.03,
  particleTrailLength: 5,
};

export const classicFireworksConfigSchema: ConfigSchemaItem[] = [
  { id: 'backgroundColor', label: 'Background Color', type: 'color' },
  { id: 'trailFade', label: 'Trail Fade', type: 'range', options: { min: 0.05, max: 0.9, step: 0.01 } },
  { id: 'hueShiftSpeed', label: 'Hue Shift Speed', type: 'range', options: { min: 0, max: 120, step: 1 } },
  { id: 'autoLaunchInterval', label: 'Auto Launch Interval', type: 'range', options: { min: 120, max: 3000, step: 10 } },
  { id: 'holdLaunchInterval', label: 'Hold Launch Interval', type: 'range', options: { min: 30, max: 600, step: 5 } },
  { id: 'rocketStartSpeed', label: 'Rocket Start Speed', type: 'range', options: { min: 0.5, max: 8, step: 0.1 } },
  { id: 'rocketAcceleration', label: 'Rocket Acceleration', type: 'range', options: { min: 1, max: 1.2, step: 0.001 } },
  { id: 'rocketTrailLength', label: 'Rocket Trail Length', type: 'range', options: { min: 1, max: 12, step: 1 } },
  { id: 'particleCount', label: 'Particle Count', type: 'range', options: { min: 10, max: 180, step: 1 } },
  { id: 'particleSpeedMin', label: 'Particle Speed Min', type: 'range', options: { min: 0.2, max: 10, step: 0.1 } },
  { id: 'particleSpeedMax', label: 'Particle Speed Max', type: 'range', options: { min: 1, max: 24, step: 0.1 } },
  { id: 'particleFriction', label: 'Particle Friction', type: 'range', options: { min: 0.8, max: 0.999, step: 0.001 } },
  { id: 'particleGravity', label: 'Particle Gravity', type: 'range', options: { min: -0.5, max: 3, step: 0.01 } },
  { id: 'particleDecayMin', label: 'Particle Decay Min', type: 'range', options: { min: 0.002, max: 0.08, step: 0.001 } },
  { id: 'particleDecayMax', label: 'Particle Decay Max', type: 'range', options: { min: 0.004, max: 0.12, step: 0.001 } },
  { id: 'particleTrailLength', label: 'Particle Trail Length', type: 'range', options: { min: 2, max: 20, step: 1 } },
];
