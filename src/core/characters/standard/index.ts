import { Character } from '../character';
import { CaoCao } from './caocao';
import { HuangYueYing } from './huangyueying';
import { LiuBei } from './liubei';
import { SunQuan } from './sunquan';
import { ZhouYu } from './zhouyu';
import { ZhuGeLiang } from './zhugeliang';

export const StandardCharacterPackage: (index: number) => Character[] = index => [
  new SunQuan(index++),
  new LiuBei(index++),
  new CaoCao(index++),
  new HuangYueYing(index++),
  new ZhuGeLiang(index++),
  new ZhouYu(index++),
];
