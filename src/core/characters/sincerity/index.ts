import { KongRong } from './kongrong';
import { MiFuRen } from './mifuren';
import { WangFuZhaoLei } from './wangfuzhaolei';
import { WangLing } from './wangling';
import { WuJing } from './wujing';
import { XinXinPi } from './xin_xinpi';
import { ZhouChu } from './zhouchu';
import { Character } from 'core/characters/character';

export const SincerityCharacterPackage: (index: number) => Character[] = index => [
  new WangLing(index++),
  new XinXinPi(index++),

  new WangFuZhaoLei(index++),
  new MiFuRen(index++),

  new WuJing(index++),
  new ZhouChu(index++),

  new KongRong(index++),
];
