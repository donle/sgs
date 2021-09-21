import { Character } from 'core/characters/character';
import { CaoXing } from './caoxing';
import { DuanWei } from './duanwei';
import { FanChou } from './fanchou';
import { GuoSi } from './guosi';
import { LiangXing } from './liangxing';
import { LiJue } from './lijue';
import { PanFeng } from './panfeng';
import { XingDaoRong } from './xingdaorong';
import { ZhangHeng } from './zhangheng';
import { ZhangJi } from './zhangji';

export const DecadePackage: (index: number) => Character[] = index => [
  new LiJue(index++),
  new GuoSi(index++),
  new FanChou(index++),
  new ZhangJi(index++),
  new LiangXing(index++),
  new DuanWei(index++),
  new ZhangHeng(index++),
  new PanFeng(index++),
  new XingDaoRong(index++),
  new CaoXing(index++),
];
