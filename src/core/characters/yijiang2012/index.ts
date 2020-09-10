import { Character } from '../character';
import { XunYou } from './xunyou';
import { ZhongHui } from './zhonghui';

export const YiJiang2012Package: (index: number) => Character[] = index => [
  new XunYou(index++),
  new ZhongHui(index++),
];
