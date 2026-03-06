import type { BackgroundModule } from '../../types';
import { defaultConfig, magicDustConfigSchema, type MagicDustConfig } from './types';
import { render } from './render';
import { generateCode } from './codegen';

export const magicDustModule: BackgroundModule<MagicDustConfig> = {
  id: 'magic-dust',
  name: 'Magic Dust',
  description: 'Glowing dust blooms follow pointer movement while ambient particles drift softly in the background.',
  defaultConfig,
  configSchema: magicDustConfigSchema,
  render,
  generateCode,
};
