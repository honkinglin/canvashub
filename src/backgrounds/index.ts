import { particleModule } from './particle';
import { waveModule } from './wave';
import { gradientModule } from './gradient';
import type { BackgroundModule } from '../types';

export const backgrounds: BackgroundModule<any>[] = [
  particleModule,
  waveModule,
  gradientModule
];

export const getBackgroundById = (id: string) => {
  return backgrounds.find(b => b.id === id);
};
