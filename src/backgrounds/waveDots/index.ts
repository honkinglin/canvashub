import type { BackgroundModule } from '../../types';
import { defaultConfig, waveDotsConfigSchema, type WaveDotsConfig } from './types';
import { render } from './render';
import { generateCode } from './codegen';

export const waveDotsModule: BackgroundModule<WaveDotsConfig> = {
  id: 'wave-dots',
  name: 'Wave Dots',
  description: 'Oscillating dot matrix that expands around cursor proximity and flows like a living wave field.',
  defaultConfig,
  configSchema: waveDotsConfigSchema,
  render,
  generateCode,
};
