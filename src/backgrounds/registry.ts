import type { BackgroundDefinition, Config } from '../types/canvas';
import { particlesBackground } from './particles';
import { wavesBackground } from './waves';
import { gradientBackground } from './gradient';

export const backgroundRegistry: BackgroundDefinition<Config>[] = [
  particlesBackground as unknown as BackgroundDefinition<Config>,
  wavesBackground as unknown as BackgroundDefinition<Config>,
  gradientBackground as unknown as BackgroundDefinition<Config>,
];

export const getBackground = (id: string): BackgroundDefinition<Config> | undefined =>
  backgroundRegistry.find((b) => b.id === id);
