import { particleModule } from './particle';
import { gradientModule } from './gradient';
import { cursorTrailModule } from './cursorTrail';

export const backgrounds = [
  particleModule,
  gradientModule,
  cursorTrailModule
];

export const getBackgroundById = (id: string) => {
  return backgrounds.find(b => b.id === id);
};
