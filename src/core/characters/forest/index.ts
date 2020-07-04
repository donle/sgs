import { Character } from '../character';
import { CaoPi } from './caopi';

export const ForestCharacterPackage: (index: number) => Character[] = index => [new CaoPi(index++)];
