import { Character } from '../character';
import { Weiyan } from './weiyan';

export const WindCharacterPackage: (index: number) => Character[] = index => [
    new Weiyan(index++),
]
