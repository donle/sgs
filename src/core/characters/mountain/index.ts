import { Character } from '../character';
import { DengAi } from './dengai';
import { ErZhang } from './erzhang';
import { JiangWei } from './jiangwei';
import { SunCe } from './sunce';

export const MountainCharacterPackage: (index: number) => Character[] = index => [
  new DengAi(index++),

  new JiangWei(index++),
  new SunCe(index++),
  new ErZhang(index++),
];
