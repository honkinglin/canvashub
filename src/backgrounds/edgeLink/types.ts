import type { ConfigRecord, ConfigSchemaItem } from '../../types';

export interface EdgeLinkConfig extends ConfigRecord {
  backgroundColor: string;
  nodeColor: string;
  lineColor: string;
  ballCount: number;
  ballRadius: number;
  speedMin: number;
  speedMax: number;
  distanceLimit: number;
  lineWidth: number;
  pulseSpeed: number;
  enableMouseNode: boolean;
  spawnPadding: number;
  boundsPadding: number;
}

export const defaultConfig: EdgeLinkConfig = {
  backgroundColor: '#040811',
  nodeColor: '#cfff04',
  lineColor: '#9a9a9a',
  ballCount: 30,
  ballRadius: 2,
  speedMin: 0.1,
  speedMax: 1,
  distanceLimit: 260,
  lineWidth: 0.8,
  pulseSpeed: 0.03,
  enableMouseNode: true,
  spawnPadding: 2,
  boundsPadding: 50,
};

export const edgeLinkConfigSchema: ConfigSchemaItem[] = [
  { id: 'backgroundColor', label: 'Background Color', type: 'color' },
  { id: 'nodeColor', label: 'Node Color', type: 'color' },
  { id: 'lineColor', label: 'Line Color', type: 'color' },
  { id: 'ballCount', label: 'Ball Count', type: 'range', options: { min: 8, max: 180, step: 1 } },
  { id: 'ballRadius', label: 'Ball Radius', type: 'range', options: { min: 0.5, max: 8, step: 0.1 } },
  { id: 'speedMin', label: 'Speed Min', type: 'range', options: { min: 0.01, max: 2, step: 0.01 } },
  { id: 'speedMax', label: 'Speed Max', type: 'range', options: { min: 0.1, max: 3, step: 0.01 } },
  { id: 'distanceLimit', label: 'Distance Limit', type: 'range', options: { min: 40, max: 520, step: 2 } },
  { id: 'lineWidth', label: 'Line Width', type: 'range', options: { min: 0.2, max: 3, step: 0.1 } },
  { id: 'pulseSpeed', label: 'Pulse Speed', type: 'range', options: { min: 0.005, max: 0.12, step: 0.001 } },
  { id: 'enableMouseNode', label: 'Enable Mouse Node', type: 'boolean' },
  { id: 'spawnPadding', label: 'Spawn Padding', type: 'range', options: { min: 0, max: 24, step: 1 } },
  { id: 'boundsPadding', label: 'Bounds Padding', type: 'range', options: { min: 10, max: 180, step: 1 } },
];
