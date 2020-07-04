import { Character } from '../character';
import { DongZhuo } from './dongzhuo';

export const ForestCharacterPackage: (index: number) => Character[] = index => [
  new DongZhuo(index++),

];
