import { Character } from '../character';
import { GodCaoCao } from './god_caocao';

export const GodCharacterPackage: (index: number) => Character[] = index => [new GodCaoCao(index++)];
