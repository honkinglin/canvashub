import type { BackgroundModule } from '../../types';
import { defaultConfig, fireworksBurstConfigSchema, type FireworksBurstConfig } from './types';
import { render } from './render';
import { generateCode } from './codegen';

export const fireworksBurstModule: BackgroundModule<FireworksBurstConfig> = {
  id: 'fireworks-burst',
  name: 'Fireworks Burst',
  description: 'Tap or click to emit colorful burst particles with an expanding shockwave ring.',
  defaultConfig,
  configSchema: fireworksBurstConfigSchema,
  render,
  generateCode,
};
