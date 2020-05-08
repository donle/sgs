import { Character } from '../character';
import { CaoRen } from './caoren';
import { Weiyan } from './weiyan';

export const WindCharacterPackage: (index: number) => Character[] = index => [new Weiyan(index++), new CaoRen(index++)];
