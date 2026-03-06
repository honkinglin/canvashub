import type { BackgroundModule } from '../../types';
import { defaultConfig, starfieldWarpConfigSchema, type StarfieldWarpConfig } from './types';
import { render } from './render';
import { generateCode } from './codegen';

export const starfieldWarpModule: BackgroundModule<StarfieldWarpConfig> = {
  id: 'starfield-warp',
  name: 'Starfield Warp',
  description: 'Retro 3D star tunnel with optional warp trails and depth-based perspective motion.',
  defaultConfig,
  configSchema: starfieldWarpConfigSchema,
  render,
  generateCode,
};
