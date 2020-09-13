import { Character } from '../character';
import { CaoChong } from './caochong';
import { GuoHuai } from './guohuai';
import { ManChong } from './manchong';
import { PanZhangMaZhong } from './panzhangmazhong';

export const YiJiang2013Package: (index: number) => Character[] = index => [
  new CaoChong(index++),
  new PanZhangMaZhong(index++),
  // new FuHuangHou(index++),
  // new GuanPing(index++),
  new GuoHuai(index++),
  // new JianYong(index++),
  // new LiRu(index++),
  // new LiuFeng(index++),
  new ManChong(index++),
  // new YuFan(index++),
  // new ZhuRan(index++),
];
