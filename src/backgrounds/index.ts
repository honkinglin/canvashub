import { textFlowModule } from './textFlow';
import { confettiModule } from './confetti';
import { particleModule } from './particle';
import { cursorTrailModule } from './cursorTrail';
import { stardustBurstModule } from './stardustBurst';

export const backgrounds = [
  textFlowModule,
  confettiModule,
  particleModule,
  cursorTrailModule,
  stardustBurstModule
];

export const getBackgroundById = (id: string) => {
  return backgrounds.find(b => b.id === id);
};
