import { Character } from 'core/characters/character';
import { CaoXing } from './caoxing';
import { DuanWei } from './duanwei';
import { DuFuRen } from './dufuren';
import { FanChou } from './fanchou';
import { GuoSi } from './guosi';
import { LiangXing } from './liangxing';
import { LiJue } from './lijue';
import { NiuJin } from './niujin';
import { PanFeng } from './panfeng';
import { TongYuanC } from './tongyuan';
import { WanNianGongZhu } from './wanniangongzhu';
import { XiaHouJie } from './xiahoujie';
import { XingDaoRong } from './xingdaorong';
import { XuGong } from './xugong';
import { XunChen } from './xunchen';
import { ZhangHeng } from './zhangheng';
import { ZhangHu } from './zhanghu';
import { ZhangJi } from './zhangji';
import { ZhangWen } from './zhangwen';
import { ZhaoZhong } from './zhaozhong';

export const DecadePackage: (index: number) => Character[] = index => [
  new NiuJin(index++),
  new ZhangHu(index++),
  new DuFuRen(index++),
  new XiaHouJie(index++),

  new XuGong(index++),
  new ZhangWen(index++),

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
  new ZhaoZhong(index++),
  new TongYuanC(index++),
  new WanNianGongZhu(index++),
  new XunChen(index++),
];
