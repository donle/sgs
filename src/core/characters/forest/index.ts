import { Character } from '../character';
import { CaoPi } from './caopi';
import { DongZhuo } from './dongzhuo';
import { Lusu } from './lusu';
import { MengHuo } from './menghuo';

export const ForestCharacterPackage: (index: number) => Character[] = index => [
  new CaoPi(index++),

  new MengHuo(index++),

  new Lusu(index++),

  new DongZhuo(index++),
];
