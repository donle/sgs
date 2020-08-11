import { Character } from '../character';
import { MaSu } from './masu';
import { XuSheng } from './xusheng';

export const YiJiang2011Package: (index: number) => Character[] = index => [new MaSu(index++), new XuSheng(index++)];
