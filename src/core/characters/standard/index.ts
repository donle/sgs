import { Character } from '../character';
import { CaoCao } from './caocao';
import { GuoJia } from './guojia';
import { HuangYueYing } from './huangyueying';
import { LiuBei } from './liubei';
import { SiMaYi } from './simayi';
import { SunQuan } from './sunquan';
import { ZhouYu } from './zhouyu';
import { ZhuGeLiang } from './zhugeliang';

export const StandardCharacterPackage: (index: number) => Character[] = index => [
  new SunQuan(index++),
  new ZhouYu(index++),

  new LiuBei(index++),
  new HuangYueYing(index++),
  new ZhuGeLiang(index++),

  new CaoCao(index++),
  new SiMaYi(index++),
  new GuoJia(index++),
];
