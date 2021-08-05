import { Character } from 'core/characters/character';
import { LiuQi } from './liuqi';
import { MaLiang } from './maliang';
import { QuYi } from './quyi';
import { SPZhaoYun } from './sp_zhaoyun';
import { ZhangLing } from './zhangling';
import { ZhouQun } from './zhouqun';

export const SPPackage: (index: number) => Character[] = index => [
  new MaLiang(index++),
  new ZhouQun(index++),

  new SPZhaoYun(index++),
  new QuYi(index++),
  new LiuQi(index++),
  new ZhangLing(index++),
];
