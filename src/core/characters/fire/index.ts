import { Character } from '../character';
import { Pangde } from './pangde';

export const FireCharacterPackage: (index: number) => Character[] = index => [
    new Pangde(index++),
]

