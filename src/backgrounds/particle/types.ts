import type { ConfigRecord, ConfigSchemaItem } from '../../types';

export interface ParticleConfig extends ConfigRecord {
  backgroundColor: string;
  lineColor: string;
  nodeColor: string;
  gridStep: number;
  neighborCount: number;
  moveRange: number;
  moveSpeed: number;
  pointerRadius: number;
  pointerSmoothing: number;
  nodeRadiusMin: number;
  nodeRadiusMax: number;
  lineWidth: number;
  idleLineAlpha: number;
  idleNodeAlpha: number;
  idleDrift: number;
}

export const defaultConfig: ParticleConfig = {
  backgroundColor: '#030712',
  lineColor: '#9cd9f9',
  nodeColor: '#9cd9f9',
  gridStep: 62,
  neighborCount: 5,
  moveRange: 46,
  moveSpeed: 1,
  pointerRadius: 220,
  pointerSmoothing: 0.1,
  nodeRadiusMin: 1.5,
  nodeRadiusMax: 3.8,
  lineWidth: 1,
  idleLineAlpha: 0.012,
  idleNodeAlpha: 0.05,
  idleDrift: 0.85,
};

export const particleConfigSchema: ConfigSchemaItem[] = [
  { id: 'backgroundColor', label: 'Background Color', type: 'color' },
  { id: 'lineColor', label: 'Line Color', type: 'color' },
  { id: 'nodeColor', label: 'Node Color', type: 'color' },
  { id: 'gridStep', label: 'Grid Step', type: 'range', options: { min: 28, max: 140, step: 2 } },
  { id: 'neighborCount', label: 'Neighbor Count', type: 'range', options: { min: 1, max: 10, step: 1 } },
  { id: 'moveRange', label: 'Move Range', type: 'range', options: { min: 4, max: 120, step: 1 } },
  { id: 'moveSpeed', label: 'Move Speed', type: 'range', options: { min: 0.2, max: 3, step: 0.1 } },
  { id: 'pointerRadius', label: 'Pointer Radius', type: 'range', options: { min: 40, max: 520, step: 5 } },
  { id: 'pointerSmoothing', label: 'Pointer Smoothing', type: 'range', options: { min: 0.01, max: 0.35, step: 0.01 } },
  { id: 'idleLineAlpha', label: 'Idle Line Alpha', type: 'range', options: { min: 0, max: 0.2, step: 0.001 } },
  { id: 'idleNodeAlpha', label: 'Idle Node Alpha', type: 'range', options: { min: 0, max: 0.35, step: 0.001 } },
  { id: 'idleDrift', label: 'Idle Drift', type: 'range', options: { min: 0, max: 1.6, step: 0.01 } },
  { id: 'nodeRadiusMin', label: 'Node Radius Min', type: 'range', options: { min: 0.5, max: 6, step: 0.1 } },
  { id: 'nodeRadiusMax', label: 'Node Radius Max', type: 'range', options: { min: 1, max: 10, step: 0.1 } },
  { id: 'lineWidth', label: 'Line Width', type: 'range', options: { min: 0.5, max: 2.5, step: 0.1 } },
];
