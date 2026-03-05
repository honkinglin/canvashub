import type { BackgroundModule } from '../../types';
import { defaultConfig, stardustBurstConfigSchema, type StardustBurstConfig } from './types';
import { render } from './render';
import { generateCode } from './codegen';

export const stardustBurstModule: BackgroundModule<StardustBurstConfig> = {
  id: 'stardust-burst',
  name: 'Stardust Burst',
  description: 'Click or tap to trigger soft cosmic particle explosions with configurable glow and drift.',
  defaultConfig,
  configSchema: stardustBurstConfigSchema,
  render,
  generateCode,
};
