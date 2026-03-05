import type { BackgroundModule } from '../../types';
import { defaultConfig, particleConfigSchema, type ParticleConfig } from './types';
import { render } from './render';
import { generateCode } from './codegen';

export const particleModule: BackgroundModule<ParticleConfig> = {
  id: 'particles',
  name: 'Network Particles',
  description: 'Interactive point-grid network with smooth drifting motion and cursor-aware glow.',
  defaultConfig,
  configSchema: particleConfigSchema,
  render,
  generateCode,
};
