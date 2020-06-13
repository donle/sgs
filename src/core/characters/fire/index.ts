import { Character } from '../character';
import { DianWei } from './dianwei';
import { Pangde } from './pangde';

export const FireCharacterPackage: (index: number) => Character[] = index => [
  new DianWei(index++),

  new Pangde(index++),
];
