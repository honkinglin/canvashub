import { particleModule } from './particle';
import { confettiModule } from './confetti';
import { textFlowModule } from './textFlow';
import { gradientModule } from './gradient';
import { cursorTrailModule } from './cursorTrail';

export const backgrounds = [
  particleModule,
  confettiModule,
  textFlowModule,
  gradientModule,
  cursorTrailModule
];

export const getBackgroundById = (id: string) => {
  return backgrounds.find(b => b.id === id);
};
