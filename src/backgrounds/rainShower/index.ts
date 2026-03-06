import type { BackgroundModule } from '../../types';
import { defaultConfig, rainShowerConfigSchema, type RainShowerConfig } from './types';
import { render } from './render';
import { generateCode } from './codegen';

export const rainShowerModule: BackgroundModule<RainShowerConfig> = {
  id: 'rain-shower',
  name: 'Rain Shower',
  description: 'High-performance rain simulation with wind interaction, splash droplets, and object pooling.',
  defaultConfig,
  configSchema: rainShowerConfigSchema,
  render,
  generateCode,
};
