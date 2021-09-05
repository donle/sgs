import { Character } from '../character';
import { GodCaoCao } from './god_caocao';
import { GodGanNing } from './god_ganning';
import { GodGuanYu } from './god_guanyu';
import { GodGuoJia } from './god_guojia';
import { GodLiuBei } from './god_liubei';
import { GodLuXun } from './god_luxun';
import { GodLvBu } from './god_lvbu';
import { GodLvMeng } from './god_lvmeng';
import { GodSiMaYi } from './god_simayi';
import { GodTaiShiCi } from './god_taishici';
import { GodZhangLiao } from './god_zhangliao';
import { GodZhaoYun } from './god_zhaoyun';
import { GodZhouYu } from './god_zhouyu';
import { GodZhuGeLiang } from './god_zhugeliang';

export const GodCharacterPackage: (index: number) => Character[] = index => [
  new GodGuanYu(index++),
  new GodLvMeng(index++),

  new GodZhouYu(index++),
  new GodZhuGeLiang(index++),

  new GodCaoCao(index++),
  new GodLvBu(index++),

  new GodZhaoYun(index++),
  new GodSiMaYi(index++),

  new GodLiuBei(index++),
  new GodLuXun(index++),

  new GodZhangLiao(index++),
  new GodGanNing(index++),

  new GodGuoJia(index++),
  new GodTaiShiCi(index++),
];
