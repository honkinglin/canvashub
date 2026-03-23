import type { BackgroundModule } from '../../types';
import { defaultConfig, bubbleBounceConfigSchema, type BubbleBounceConfig } from './types';
import { render } from './render';
import { generateCode } from './codegen';

export const bubbleBounceModule: BackgroundModule<BubbleBounceConfig> = {
  id: 'bubble-bounce',
  name: 'Bubble Bounce',
  description: 'Outlined blue bubbles bounce across the viewport with clean kinetic motion and configurable glow-trail persistence.',
  defaultConfig,
  configSchema: bubbleBounceConfigSchema,
  render,
  generateCode,
};
