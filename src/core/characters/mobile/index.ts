import { Character } from '../character';
import { LiFeng } from './lifeng';
import { LingCao } from './lingcao';
import { SiMaZhao } from './simazhao';
import { SunRu } from './sunru';
import { XingGanNing } from './xing_ganning';

export const MobilePackage: (index: number) => Character[] = index => [
  new SiMaZhao(index++),

  new LiFeng(index++),

  new LingCao(index++),
  new SunRu(index++),

  new XingGanNing(index++),
];
