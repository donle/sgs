import { Character } from '../character';
import { DianWei } from './dianwei';
import { Pangde } from './pangde';
import { PangTong } from './pangtong';
import { TaiShiCi } from './taishici';
import { WoLong } from './wolong';
import { XunYu } from './xunyu';
import { YanLiangWenChou } from './yanliangwenchou';
import { YuanShao } from './yuanshao';

export const FireCharacterPackage: (index: number) => Character[] = index => [
  new DianWei(index++),
  new XunYu(index++),

  new WoLong(index++),
  new PangTong(index++),

  new TaiShiCi(index++),

  new YuanShao(index++),
  new Pangde(index++),
  new YanLiangWenChou(index++),
];
