import type { BackgroundModule } from '../../types';
import { defaultConfig, dotCountdownConfigSchema, type DotCountdownConfig } from './types';
import { render } from './render';
import { generateCode } from './codegen';

export const dotCountdownModule: BackgroundModule<DotCountdownConfig> = {
  id: 'dot-countdown',
  name: 'Dot Countdown',
  description: 'Color dots scatter, gather into countdown numbers, then break apart in a loop.',
  defaultConfig,
  configSchema: dotCountdownConfigSchema,
  render,
  generateCode,
};
