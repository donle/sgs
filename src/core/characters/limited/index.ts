import { Character } from 'core/characters/character';
import { CaoChun } from './caochun';
import { JiangGan } from './jianggan';
import { RuanYu } from './ruanyu';

export const LimitedPackage: (index: number) => Character[] = index => [
  new CaoChun(index++),
  new JiangGan(index++),
  new RuanYu(index++),
];
