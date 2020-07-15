import { Character } from '../character';
import { DengAi } from './dengai';
import { ErZhang } from './erzhang';
import { SunCe } from './sunce';

export const MountainCharacterPackage: (index: number) => Character[] = index => [
  new DengAi(index++),

  new SunCe(index++),
  new ErZhang(index++),
];
