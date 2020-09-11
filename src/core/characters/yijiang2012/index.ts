import { Character } from '../character';
import { XunYou } from './xunyou';

export const YiJiang2012Package: (index: number) => Character[] = index => [new XunYou(index++)];
