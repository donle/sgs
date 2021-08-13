import { Character } from 'core/characters/character';
import { DongYun } from './dongyun';
import { LiuQi } from './liuqi';
import { MaLiang } from './maliang';
import { QuYi } from './quyi';
import { ShaMoKe } from './shamoke';
import { SPZhaoYun } from './sp_zhaoyun';
import { WuTuGu } from './wutugu';
import { ZhangLing } from './zhangling';
import { ZhouQun } from './zhouqun';

export const SPPackage: (index: number) => Character[] = index => [
  new MaLiang(index++),
  new ZhouQun(index++),
  new DongYun(index++),
  new ShaMoKe(index++),

  new SPZhaoYun(index++),
  new QuYi(index++),
  new LiuQi(index++),
  new ZhangLing(index++),
  new WuTuGu(index++),
];
