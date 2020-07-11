import { Character } from '../character';
import { CaoPi } from './caopi';
import { DongZhuo } from './dongzhuo';
import { Lusu } from './lusu';

export const ForestCharacterPackage: (index: number) => Character[] = index => [
  new CaoPi(index++),
  new Lusu(index++),
  new DongZhuo(index++),
];
