import type { BackgroundModule } from '../../types';
import { defaultConfig, pixelGridTrailConfigSchema, type PixelGridTrailConfig } from './types';
import { render } from './render';
import { generateCode } from './codegen';

export const pixelGridTrailModule: BackgroundModule<PixelGridTrailConfig> = {
  id: 'pixel-grid-trail',
  name: 'Pixel Grid Trail',
  description: 'Dark pixel grid lit by colorful mouse trails that fade and spread across nearby cells.',
  defaultConfig,
  configSchema: pixelGridTrailConfigSchema,
  render,
  generateCode,
};
