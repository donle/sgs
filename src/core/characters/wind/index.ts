import { Character } from '../character';
import { CaoRen } from './caoren';
import { Weiyan } from './weiyan';
import { ZhangJiao } from './zhangjiao';
import { ZhouTai } from './zhoutai';

export const WindCharacterPackage: (index: number) => Character[] = index => [
  new CaoRen(index++),

  new Weiyan(index++),

  new ZhouTai(index++),

  new ZhangJiao(index++),
];
