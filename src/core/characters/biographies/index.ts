import { Character } from 'core/characters/character';
import { CaoSong } from './caosong';
import { DingYuan } from './dingyuan';
import { DongCheng } from './dongcheng';
import { HuCheEr } from './hucheer';
import { QiuLiJu } from './qiuliju';
import { WangRong } from './wangrong';
import { XuShao } from './xushao';

export const BiographiesPackage: (index: number) => Character[] = index => [
  new CaoSong(index++),

  new XuShao(index++),
  new WangRong(index++),
  new DingYuan(index++),
  new DongCheng(index++),
  new HuCheEr(index++),
  new QiuLiJu(index++),
];
