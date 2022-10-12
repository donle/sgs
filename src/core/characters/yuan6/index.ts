import { CenHun } from './cenhun';
import { LiYan } from './liyan';
import { SunDeng } from './sundeng';
import { SunZiLiuFang } from './sunziliufang';
import { ZhangRang } from './zhangrang';
import { Character } from '../character';

export const Yuan6Package: (index: number) => Character[] = index => [
  new SunZiLiuFang(index++),

  new LiYan(index++),

  new SunDeng(index++),
  new CenHun(index++),

  new ZhangRang(index++),
];
