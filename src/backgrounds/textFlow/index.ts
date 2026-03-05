import type { BackgroundModule } from '../../types';
import { defaultConfig, textFlowConfigSchema, type TextFlowConfig } from './types';
import { render } from './render';
import { generateCode } from './codegen';

export const textFlowModule: BackgroundModule<TextFlowConfig> = {
  id: 'text-flow',
  name: 'Text Flow',
  description: 'Particles emit from text and drift through a configurable flow field and gravity.',
  defaultConfig,
  configSchema: textFlowConfigSchema,
  render,
  generateCode,
};
