import { Character } from 'core/characters/character';
import { XuShao } from './xushao';

export const BiographiesPackage: (index: number) => Character[] = index => [
  new XuShao(index++),
];
