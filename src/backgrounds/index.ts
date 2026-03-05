import { particleModule } from './particle';
import { confettiModule } from './confetti';
import { gradientModule } from './gradient';
import { cursorTrailModule } from './cursorTrail';

export const backgrounds = [
  particleModule,
  confettiModule,
  gradientModule,
  cursorTrailModule
];

export const getBackgroundById = (id: string) => {
  return backgrounds.find(b => b.id === id);
};
