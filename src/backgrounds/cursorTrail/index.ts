import type { BackgroundModule } from '../../types';
import { defaultConfig, cursorTrailConfigSchema, type CursorTrailConfig } from './types';
import { render } from './render';
import { generateCode } from './codegen';

export const cursorTrailModule: BackgroundModule<CursorTrailConfig> = {
  id: 'cursor-trail',
  name: 'Cursor Trail',
  description: 'High-density micro particles with mouse-follow turbulence and cinematic trails.',
  defaultConfig,
  configSchema: cursorTrailConfigSchema,
  render,
  generateCode,
};
