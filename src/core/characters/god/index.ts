import { Character } from '../character';
import { GodCaoCao } from './god_caocao';
import { GodGuanYu } from './god_guanyu';
import { GodLuXun } from './god_luxun';
import { GodLvBu } from './god_lvbu';
import { GodLvMeng } from './god_lvmeng';
import { GodSiMaYi } from './god_simayi';
import { GodZhaoYun } from './god_zhaoyun';
import { GodZhouYu } from './god_zhouyu';
import { GodZhuGeLiang } from './god_zhugeliang';

export const GodCharacterPackage: (index: number) => Character[] = index => [
  new GodGuanYu(index++),
  new GodLvMeng(index++),
  new GodZhouYu(index++),
  new GodLvBu(index++),
  new GodZhuGeLiang(index++),
  new GodCaoCao(index++),
  new GodSiMaYi(index++),
  new GodLuXun(index++),
  new GodZhaoYun(index++),
];
