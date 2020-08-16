import { Character } from '../character';
import { CaoZhi } from './caozhi';
import { MaSu } from './masu';
import { XuShu } from './xushu';

export const YiJiang2011Package: (index: number) => Character[] = index => [
  new MaSu(index++),
  new XuShu(index++),
  new CaoZhi(index++),
];
