import { confettiModule } from './confetti';
import { textFlowModule } from './textFlow';
import { cursorTrailModule } from './cursorTrail';
import { edgeLinkModule } from './edgeLink';
import { particleModule } from './particle';
import { stardustBurstModule } from './stardustBurst';
import { fireworksBurstModule } from './fireworksBurst';

export const backgrounds = [
  confettiModule,
  textFlowModule,
  cursorTrailModule,
  edgeLinkModule,
  particleModule,
  stardustBurstModule,
  fireworksBurstModule,
];

export const getBackgroundById = (id: string) => {
  return backgrounds.find(b => b.id === id);
};
