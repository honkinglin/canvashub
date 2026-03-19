import type { BackgroundModule } from '../../types';
import { defaultConfig, bubbleDriftConfigSchema, type BubbleDriftConfig } from './types';
import { render } from './render';
import { generateCode } from './codegen';

export const bubbleDriftModule: BackgroundModule<BubbleDriftConfig> = {
  id: 'bubble-drift',
  name: 'Bubble Drift',
  description: 'Soft glowing bubbles rise upward and gently repel from cursor movement for a calm ocean-like atmosphere.',
  defaultConfig,
  configSchema: bubbleDriftConfigSchema,
  render,
  generateCode,
};
