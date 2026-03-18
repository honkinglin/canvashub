import type { ConfigRecord, ConfigSchemaItem } from '../../types';

export interface WaveDotsConfig extends ConfigRecord {
  backgroundColor: string;
  dotColor: string;
  rows: number;
  cols: number;
  pointerRadius: number;
  pointerForce: number;
  alphaDecay: number;
  maxScale: number;
  baseRadius: number;
  radiusGain: number;
  waveSpeed: number;
  waveAmplitude: number;
  waveFrequency: number;
  autoMotion: boolean;
}

export const defaultConfig: WaveDotsConfig = {
  backgroundColor: '#000000',
  dotColor: '#ffffff',
  rows: 50,
  cols: 50,
  pointerRadius: 150,
  pointerForce: 0.6,
  alphaDecay: 9,
  maxScale: 400,
  baseRadius: 1,
  radiusGain: 8,
  waveSpeed: 2.5,
  waveAmplitude: 1,
  waveFrequency: 1,
  autoMotion: true,
};

export const waveDotsConfigSchema: ConfigSchemaItem[] = [
  { id: 'backgroundColor', label: 'Background Color', type: 'color' },
  { id: 'dotColor', label: 'Dot Color', type: 'color' },
  { id: 'rows', label: 'Rows', type: 'range', options: { min: 12, max: 120, step: 1 } },
  { id: 'cols', label: 'Cols', type: 'range', options: { min: 12, max: 160, step: 1 } },
  { id: 'pointerRadius', label: 'Pointer Radius', type: 'range', options: { min: 20, max: 420, step: 1 } },
  { id: 'pointerForce', label: 'Pointer Force', type: 'range', options: { min: 0.05, max: 2.5, step: 0.01 } },
  { id: 'alphaDecay', label: 'Alpha Decay', type: 'range', options: { min: 0.1, max: 40, step: 0.1 } },
  { id: 'maxScale', label: 'Max Scale', type: 'range', options: { min: 20, max: 800, step: 1 } },
  { id: 'baseRadius', label: 'Dot Radius', type: 'range', options: { min: 0.2, max: 6, step: 0.1 } },
  { id: 'radiusGain', label: 'Radius Gain', type: 'range', options: { min: 1, max: 20, step: 0.1 } },
  { id: 'waveSpeed', label: 'Wave Speed', type: 'range', options: { min: 0.1, max: 10, step: 0.05 } },
  { id: 'waveAmplitude', label: 'Wave Amplitude', type: 'range', options: { min: 0, max: 3, step: 0.05 } },
  { id: 'waveFrequency', label: 'Wave Frequency', type: 'range', options: { min: 0.1, max: 2.4, step: 0.05 } },
  { id: 'autoMotion', label: 'Auto Motion', type: 'boolean' },
];
