import type { BackgroundModule } from '../../types';
import { defaultConfig, classicFireworksConfigSchema, type ClassicFireworksConfig } from './types';
import { render } from './render';
import { generateCode } from './codegen';

export const classicFireworksModule: BackgroundModule<ClassicFireworksConfig> = {
  id: 'classic-fireworks',
  name: 'Classic Fireworks',
  description: 'Rockets launch from the ground, burst into particles, and blend with bright additive trails.',
  defaultConfig,
  configSchema: classicFireworksConfigSchema,
  render,
  generateCode,
};
