import type { BackgroundModule } from '../../types';
import { defaultConfig, branchLinesConfigSchema, type BranchLinesConfig } from './types';
import { render } from './render';
import { generateCode } from './codegen';

export const branchLinesModule: BackgroundModule<BranchLinesConfig> = {
  id: 'branch-lines',
  name: 'Branch Lines',
  description: 'Neon branching lines grow from center, split recursively, and paint colorful trails.',
  defaultConfig,
  configSchema: branchLinesConfigSchema,
  render,
  generateCode,
};
