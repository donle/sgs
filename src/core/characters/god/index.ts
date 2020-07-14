import { Character } from '../character';
import { GodCaoCao } from './god_caocao';
import { GodGuanYu } from './god_guanyu';
import { GodLuXun } from './god_luxun';
import { GodLvBu } from './god_lvbu';
import { GodLvMeng } from './god_lvmeng';
import { GodSiMaYi } from './god_simayi';
import { GodZhouYu } from './god_zhouyu';

export const GodCharacterPackage: (index: number) => Character[] = index => [
  new GodGuanYu(index++),
  new GodLvMeng(index++),
  new GodZhouYu(index++),
  new GodLvBu(index++),
  new GodCaoCao(index++),
  new GodSiMaYi(index++),
  new GodLuXun(index++),
];
