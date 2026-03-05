import type { BackgroundModule } from '../../types';
import { defaultConfig, gradientConfigSchema, type GradientConfig } from './types';
import { render } from './render';
import { generateCode } from './codegen';

export const gradientModule: BackgroundModule<GradientConfig> = {
  id: 'gradient',
  name: 'Fluid Gradient',
  description: 'Organic, moving radial gradients that blend together smoothly.',
  defaultConfig,
  configSchema: gradientConfigSchema,
  render,
  generateCode,
};
