import type { BackgroundModule } from '../../types';
import { defaultConfig, flowTrianglesConfigSchema, type FlowTrianglesConfig } from './types';
import { render } from './render';
import { generateCode } from './codegen';

export const flowTrianglesModule: BackgroundModule<FlowTrianglesConfig> = {
  id: 'flow-triangles',
  name: 'Flow Triangles',
  description: 'Pointer-driven triangle particles flow through a procedural vector field with smooth color drift.',
  defaultConfig,
  configSchema: flowTrianglesConfigSchema,
  render,
  generateCode,
};
