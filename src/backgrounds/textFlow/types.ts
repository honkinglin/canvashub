import type { ConfigRecord, ConfigSchemaItem } from '../../types';

export interface TextFlowConfig extends ConfigRecord {
  text: string;
  backgroundColor: string;
  flow: number;
  topSpeed: number;
  lifeSpan: number;
  flowOffset: number;
  gravityDirection: number;
  gravityForce: number;
  particleScale: number;
  density: number;
  particleLimit: number;
}

export const defaultConfig: TextFlowConfig = {
  text: 'Hello',
  backgroundColor: '#ffffff',
  flow: 2,
  topSpeed: 500,
  lifeSpan: 1000,
  flowOffset: 0,
  gravityDirection: 90,
  gravityForce: 0,
  particleScale: 1,
  density: 1,
  particleLimit: 1800,
};

export const textFlowConfigSchema: ConfigSchemaItem[] = [
  { id: 'text', label: 'Text', type: 'text' },
  { id: 'backgroundColor', label: 'Background Color', type: 'color' },
  { id: 'flow', label: 'Flow', type: 'range', options: { min: 0, max: 100, step: 1 } },
  { id: 'topSpeed', label: 'Top Speed', type: 'range', options: { min: 10, max: 1000, step: 5 } },
  { id: 'lifeSpan', label: 'Lifespan', type: 'range', options: { min: 100, max: 2000, step: 10 } },
  { id: 'flowOffset', label: 'Flow Offset', type: 'range', options: { min: 0, max: Math.PI * 2, step: 0.01 } },
  { id: 'gravityDirection', label: 'Gravity Direction', type: 'range', options: { min: 0, max: 360, step: 1 } },
  { id: 'gravityForce', label: 'Gravity Force', type: 'range', options: { min: 0, max: 100, step: 1 } },
  { id: 'particleScale', label: 'Particle Scale', type: 'range', options: { min: 0.4, max: 2.4, step: 0.05 } },
  { id: 'density', label: 'Density', type: 'range', options: { min: 1, max: 4, step: 0.1 } },
  { id: 'particleLimit', label: 'Particle Limit', type: 'range', options: { min: 100, max: 5000, step: 50 } },
];
