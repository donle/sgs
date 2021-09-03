import { Character } from 'core/characters/character';
import { FanChou } from './fanchou';
import { GuoSi } from './guosi';
import { LiangXing } from './liangxing';
import { LiJue } from './lijue';
import { ZhangJi } from './zhangji';

export const DecadePackage: (index: number) => Character[] = index => [
  new LiJue(index++),
  new GuoSi(index++),
  new FanChou(index++),
  new ZhangJi(index++),
  new LiangXing(index++),
];
