import { Character } from '../character';
import { CaiWenJi } from './caiwenji';
import { DengAi } from './dengai';
import { ErZhang } from './erzhang';
import { JiangWei } from './jiangwei';
import { LiuShan } from './liushan';
import { SunCe } from './sunce';
import { ZhangHe } from './zhanghe';
import { ZuoCi } from './zuoci';

export const MountainCharacterPackage: (index: number) => Character[] = index => [
  new DengAi(index++),
  new ZhangHe(index++),
  new CaiWenJi(index++),

  new JiangWei(index++),
  new LiuShan(index++),

  new SunCe(index++),
  new ErZhang(index++),
  new ZuoCi(index++),
];
