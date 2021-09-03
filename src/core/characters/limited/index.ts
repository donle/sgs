import { Character } from 'core/characters/character';
import { CaoChun } from './caochun';
import { JiangGan } from './jianggan';
import { RuanYu } from './ruanyu';
import { ZhuGeGuo } from './zhugeguo';

export const LimitedPackage: (index: number) => Character[] = index => [
  new CaoChun(index++),
  new JiangGan(index++),
  new RuanYu(index++),

  new ZhuGeGuo(index++),
];
