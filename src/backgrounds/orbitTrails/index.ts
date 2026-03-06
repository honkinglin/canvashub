import type { BackgroundModule } from '../../types';
import { defaultConfig, orbitTrailsConfigSchema, type OrbitTrailsConfig } from './types';
import { render } from './render';
import { generateCode } from './codegen';

export const orbitTrailsModule: BackgroundModule<OrbitTrailsConfig> = {
  id: 'orbit-trails',
  name: 'Orbit Trails',
  description: 'Mouse-following orbit particles with responsive radius boost and smooth motion trails.',
  defaultConfig,
  configSchema: orbitTrailsConfigSchema,
  render,
  generateCode,
};
