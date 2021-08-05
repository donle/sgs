import { Character } from 'core/characters/character';
import { KongRong } from './kongrong';
import { WangFuZhaoLei } from './wangfuzhaolei';
import { WangLing } from './wangling';
import { WuJing } from './wujing';
import { ZhouChu } from './zhouchu';

export const SincerityCharacterPackage: (index: number) => Character[] = index => [
  new WangLing(index++),

  new WangFuZhaoLei(index++),

  new WuJing(index++),
  new ZhouChu(index++),

  new KongRong(index++),
];
