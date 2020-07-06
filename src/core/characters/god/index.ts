import { Character } from '../character';
import { GodCaoCao } from './god_caocao';
import { GodGuanYu } from './god_guanyu';
import { GodLvMeng } from './god_lvmeng';

export const GodCharacterPackage: (index: number) => Character[] = index => [
  new GodCaoCao(index++),
  new GodGuanYu(index++),
  new GodLvMeng(index++),
];
