import type { BackgroundModule } from '../../types';
import { defaultConfig, confettiConfigSchema, type ConfettiConfig } from './types';
import { render } from './render';
import { generateCode } from './codegen';

export const confettiModule: BackgroundModule<ConfettiConfig> = {
  id: 'confetti',
  name: 'Confetti Drift',
  description: 'Colorful floating particles with gentle wind and mouse-driven horizontal flow.',
  defaultConfig,
  configSchema: confettiConfigSchema,
  render,
  generateCode,
};
