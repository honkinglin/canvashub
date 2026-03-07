import type { BackgroundModule } from '../../types';
import { defaultConfig, ambientFireworksConfigSchema, type AmbientFireworksConfig } from './types';
import { render } from './render';
import { generateCode } from './codegen';

export const ambientFireworksModule: BackgroundModule<AmbientFireworksConfig> = {
  id: 'ambient-fireworks',
  name: 'Ambient Fireworks',
  description: 'Auto-bursting particle fireworks with trail fade, additive blending, and object pooling.',
  defaultConfig,
  configSchema: ambientFireworksConfigSchema,
  render,
  generateCode,
};
