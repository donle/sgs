import { Character } from '../character';
import { DianWei } from './dianwei';
import { Pangde } from './pangde';
import { XunYu } from './xunyu';

export const FireCharacterPackage: (index: number) => Character[] = index => [
  new DianWei(index++),
  new XunYu(index++),

  new Pangde(index++),
];
