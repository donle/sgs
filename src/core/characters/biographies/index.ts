import { Character } from 'core/characters/character';
import { CaoAnMin } from './caoanmin';
import { CaoSong } from './caosong';
import { DingYuan } from './dingyuan';
import { DongCheng } from './dongcheng';
import { HuCheEr } from './hucheer';
import { QiuLiJu } from './qiuliju';
import { WangRong } from './wangrong';
import { XuShao } from './xushao';
import { YanRou } from './yanrou';

export const BiographiesPackage: (index: number) => Character[] = index => [
  new CaoSong(index++),
  new CaoAnMin(index++),
  new YanRou(index++),

  new XuShao(index++),
  new WangRong(index++),
  new DingYuan(index++),
  new DongCheng(index++),
  new HuCheEr(index++),
  new QiuLiJu(index++),
];
