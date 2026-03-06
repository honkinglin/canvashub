import { confettiModule } from './confetti';
import { textFlowModule } from './textFlow';
import { cursorTrailModule } from './cursorTrail';
import { edgeLinkModule } from './edgeLink';
import { particleModule } from './particle';
import { stardustBurstModule } from './stardustBurst';
import { fireworksBurstModule } from './fireworksBurst';
import { starfieldWarpModule } from './starfieldWarp';
import { orbitTrailsModule } from './orbitTrails';
import { dotCountdownModule } from './dotCountdown';
import { classicFireworksModule } from './classicFireworks';
import { branchLinesModule } from './branchLines';
import { magicDustModule } from './magicDust';
import { flowTrianglesModule } from './flowTriangles';
import { rainShowerModule } from './rainShower';

export const backgrounds = [
  confettiModule,
  textFlowModule,
  cursorTrailModule,
  edgeLinkModule,
  particleModule,
  stardustBurstModule,
  fireworksBurstModule,
  starfieldWarpModule,
  orbitTrailsModule,
  dotCountdownModule,
  classicFireworksModule,
  branchLinesModule,
  magicDustModule,
  flowTrianglesModule,
  rainShowerModule,
];

export const getBackgroundById = (id: string) => {
  return backgrounds.find(b => b.id === id);
};
