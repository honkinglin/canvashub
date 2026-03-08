import type { BackgroundModule } from '../../types';
import { defaultConfig, snowDriftConfigSchema, type SnowDriftConfig } from './types';
import { render } from './render';
import { generateCode } from './codegen';

export const snowDriftModule: BackgroundModule<SnowDriftConfig> = {
  id: 'snow-drift',
  name: 'Snow Drift',
  description: 'Soft snow particles drifting down with wind, sway, and optional pointer interaction.',
  defaultConfig,
  configSchema: snowDriftConfigSchema,
  render,
  generateCode,
};
