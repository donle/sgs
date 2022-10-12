import { LiuYan } from './liuyan';
import { LiuYao } from './liuyao';
import { LvDai } from './lvdai';
import { LvQian } from './lvqian';
import { PanJun } from './panjun';
import { SparkPangTong } from './spark_pangtong';
import { YanJun } from './yanjun';
import { ZhouFang } from './zhoufang';
import { Character } from 'core/characters/character';

export const SparkPackage: (index: number) => Character[] = index => [
  new LvQian(index++),

  new SparkPangTong(index++),
  new PanJun(index++),
  new YanJun(index++),
  new ZhouFang(index++),
  new LvDai(index++),

  new LiuYan(index++),
  new LiuYao(index++),
];
