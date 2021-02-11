import { Character } from '../character';
import { CaoChong } from './caochong';
import { GuanPing } from './guanping';
import { GuoHuai } from './guohuai';
import { JianYong } from './jianyong';
import { LiRu } from './liru';
import { LiuFeng } from './liufeng';
import { ManChong } from './manchong';
import { PanZhangMaZhong } from './panzhangmazhong';
import { YuFan } from './yufan';
import { ZhuRan } from './zhuran';

export const YiJiang2013Package: (index: number) => Character[] = index => [
  new CaoChong(index++),
  // new FuHuangHou(index++),
  new GuanPing(index++),
  new GuoHuai(index++),
  new LiRu(index++),
  new JianYong(index++),
  new LiuFeng(index++),
  new ManChong(index++),
  new PanZhangMaZhong(index++),
  new YuFan(index++),
  new ZhuRan(index++),
];
