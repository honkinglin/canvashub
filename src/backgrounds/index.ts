import { particleModule } from './particle';
import { waveModule } from './wave';
import { gradientModule } from './gradient';
import { cursorTrailModule } from './cursorTrail';

export const backgrounds = [
  particleModule,
  waveModule,
  gradientModule,
  cursorTrailModule
];

export const getBackgroundById = (id: string) => {
  return backgrounds.find(b => b.id === id);
};
