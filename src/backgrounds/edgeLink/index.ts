import type { BackgroundModule } from '../../types';
import { defaultConfig, edgeLinkConfigSchema, type EdgeLinkConfig } from './types';
import { render } from './render';
import { generateCode } from './codegen';

export const edgeLinkModule: BackgroundModule<EdgeLinkConfig> = {
  id: 'edge-link',
  name: 'Edge Link',
  description: 'Dots drift in from the edges, pulse in alpha, and connect with nearby nodes plus cursor.',
  defaultConfig,
  configSchema: edgeLinkConfigSchema,
  render,
  generateCode,
};
