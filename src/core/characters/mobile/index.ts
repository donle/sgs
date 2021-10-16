import { Character } from '../character';
import { DengZhi } from './dengzhi';
import { GongSunKang } from './gongsunkang';
import { JiaKui } from './jiakui';
import { LiFeng } from './lifeng';
import { LingCao } from './lingcao';
import { MobileFuRong } from './mobile_furong';
import { SiMaShi } from './simashi';
import { SiMaZhao } from './simazhao';
import { SunRu } from './sunru';
import { XingGanNing } from './xing_ganning';
import { YangBiao } from './yangbiao';

export const MobilePackage: (index: number) => Character[] = index => [
  new SiMaZhao(index++),
  new JiaKui(index++),
  new SiMaShi(index++),

  new LiFeng(index++),
  new DengZhi(index++),
  new MobileFuRong(index++),

  new LingCao(index++),
  new SunRu(index++),

  new YangBiao(index++),
  new XingGanNing(index++),
  new GongSunKang(index++),
];
