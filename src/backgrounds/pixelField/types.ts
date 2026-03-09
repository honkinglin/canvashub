import type { ConfigRecord, ConfigSchemaItem } from '../../types';

export interface PixelFieldConfig extends ConfigRecord {
  backgroundColor: string;
  particleColor: string;
  rows: number;
  cols: number;
  spacing: number;
  margin: number;
  thickness: number;
  drag: number;
  ease: number;
  autoMotion: boolean;
  motionScale: number;
  interlace: boolean;
}

export const defaultConfig: PixelFieldConfig = {
  backgroundColor: '#060b17',
  particleColor: '#dce6ff',
  rows: 72,
  cols: 220,
  spacing: 3,
  margin: 90,
  thickness: 80,
  drag: 0.95,
  ease: 0.25,
  autoMotion: true,
  motionScale: 0.45,
  interlace: true,
};

export const pixelFieldConfigSchema: ConfigSchemaItem[] = [
  { id: 'backgroundColor', label: 'Background Color', type: 'color' },
  { id: 'particleColor', label: 'Particle Color', type: 'color' },
  { id: 'rows', label: 'Rows', type: 'range', options: { min: 10, max: 180, step: 1 } },
  { id: 'cols', label: 'Cols', type: 'range', options: { min: 20, max: 420, step: 1 } },
  { id: 'spacing', label: 'Spacing', type: 'range', options: { min: 1, max: 8, step: 1 } },
  { id: 'margin', label: 'Margin', type: 'range', options: { min: 0, max: 220, step: 1 } },
  { id: 'thickness', label: 'Thickness', type: 'range', options: { min: 10, max: 240, step: 1 } },
  { id: 'drag', label: 'Drag', type: 'range', options: { min: 0.75, max: 0.995, step: 0.001 } },
  { id: 'ease', label: 'Ease', type: 'range', options: { min: 0.02, max: 0.6, step: 0.01 } },
  { id: 'autoMotion', label: 'Auto Motion', type: 'boolean' },
  { id: 'motionScale', label: 'Motion Scale', type: 'range', options: { min: 0.05, max: 0.7, step: 0.01 } },
  { id: 'interlace', label: 'Interlace', type: 'boolean' },
];
