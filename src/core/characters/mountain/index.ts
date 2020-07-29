import { Character } from '../character';
import { DengAi } from './dengai';
import { ErZhang } from './erzhang';
import { JiangWei } from './jiangwei';
import { LiuShan } from './liushan';
import { SunCe } from './sunce';
import { ZhangHe } from './zhanghe';

export const MountainCharacterPackage: (index: number) => Character[] = index => [
  new DengAi(index++),
  new ZhangHe(index++),

  new JiangWei(index++),
  new LiuShan(index++),
  
  new SunCe(index++),
  new ErZhang(index++),
];
