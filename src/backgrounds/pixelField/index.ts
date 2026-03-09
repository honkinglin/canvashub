import type { BackgroundModule } from '../../types';
import { defaultConfig, pixelFieldConfigSchema, type PixelFieldConfig } from './types';
import { render } from './render';
import { generateCode } from './codegen';

export const pixelFieldModule: BackgroundModule<PixelFieldConfig> = {
  id: 'pixel-field',
  name: 'Pixel Field',
  description: 'Dense pixel grid that bends away from cursor force, with spring-back motion and optional interlaced rendering.',
  defaultConfig,
  configSchema: pixelFieldConfigSchema,
  render,
  generateCode,
};
