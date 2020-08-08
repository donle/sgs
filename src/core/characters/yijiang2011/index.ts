import { Character } from '../character';
import { MaSu } from './masu';

export const YiJiang2011Package: (index: number) => Character[] = index => [
  new MaSu(index++),
];
