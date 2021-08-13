import { Character } from 'core/characters/character';
import { LiuYan } from './liuyan';
import { LvDai } from './lvdai';
import { LvQian } from './lvqian';
import { PanJun } from './panjun';
import { SparkPangTong } from './spark_pangtong';
import { YanJun } from './yanjun';

export const SparkPackage: (index: number) => Character[] = index => [
  new LvQian(index++),

  new SparkPangTong(index++),
  new PanJun(index++),
  new YanJun(index++),
  new LvDai(index++),

  new LiuYan(index++),
];
