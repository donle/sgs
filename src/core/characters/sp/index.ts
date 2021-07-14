import { Character } from 'core/characters/character';
import { LiuQi } from './liuqi';
import { QuYi } from './quyi';

export const SPPackage: (index: number) => Character[] = index => [
  new QuYi(index++),
  new LiuQi(index++),
];
