import { Character } from '../character';
import { MaSu } from './masu';
import { XuSheng } from './xusheng';
import { XuShu } from './xushu';

export const YiJiang2011Package: (index: number) => Character[] = index => [
  new MaSu(index++),
  new XuShu(index++),
  new XuSheng(index++),
];
