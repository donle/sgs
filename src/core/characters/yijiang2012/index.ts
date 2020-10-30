import { Character } from '../character';
import { HanDang } from './handang';
import { LiaoHua } from './liaohua';
import { MaDai } from './madai';
import { WangYi } from './wangyi';
import { XunYou } from './xunyou';
import { ZhongHui } from './zhonghui';

export const YiJiang2012Package: (index: number) => Character[] = index => [
  new XunYou(index++),
  new ZhongHui(index++),
  new WangYi(index++),
  
  new LiaoHua(index++),
  new MaDai(index++),

  new HanDang(index++),
];
