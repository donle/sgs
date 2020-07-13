import { Character } from '../character';
import { GodCaoCao } from './god_caocao';
import { GodGuanYu } from './god_guanyu';
import { GodLvMeng } from './god_lvmeng';
import { GodSiMaYi } from './god_simayi';
import { GodZhouYu } from './god_zhouyu';

export const GodCharacterPackage: (index: number) => Character[] = index => [
  new GodGuanYu(index++),
  new GodLvMeng(index++),
  new GodZhouYu(index++),
  new GodCaoCao(index++),
  new GodSiMaYi(index++),
];
