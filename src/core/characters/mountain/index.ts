import { Character } from '../character';
import { DengAi } from './dengai';
import { ErZhang } from './erzhang';
import { JiangWei } from './jiangwei';
import { LiuShan } from './liushan';
import { SunCe } from './sunce';
import { ZuoCi } from './zuoci';

export const MountainCharacterPackage: (index: number) => Character[] = index => [
  new DengAi(index++),
  new JiangWei(index++),
  new LiuShan(index++),
  new SunCe(index++),
  new ErZhang(index++),
  new ZuoCi(index++),
];
