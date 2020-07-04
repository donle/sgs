import { Character } from '../character';
import { CaoPi } from './caopi';
import { DongZhuo } from './dongzhuo';

export const ForestCharacterPackage: (index: number) => Character[] = index => [
  new CaoPi(index++),
  new DongZhuo(index++),
];
