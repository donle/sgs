import { Card } from '../card';
import { CardSuit } from '../libs/card_props';
import { Jink } from '../standard/jink';
import { Peach } from '../standard/peach';
import { WuXieKeJi } from '../standard/wuxiekeji';
import { BaiYinShiZi } from './baiyinshizi';
import { BingLiangCunDuan } from './bingliangcunduan';
import { FireSlash } from './fire_slash';
import { HuaLiu } from './hualiu';
import { HuoGong } from './huogong';
import { TengJia } from './tengjia';
import { ThunderSlash } from './thunder_slash';
import { TieSuoLianHuan } from './tiesuolianhuan';

export const LegionFightCardPackage: (index: number) => Card[] = index => [
  new HuoGong(index++, 2, CardSuit.Heart),
  new HuoGong(index++, 3, CardSuit.Heart),
  new HuoGong(index++, 12, CardSuit.Diamond),

  new BingLiangCunDuan(index++, 10, CardSuit.Spade),
  new BingLiangCunDuan(index++, 4, CardSuit.Club),

  new TengJia(index++, 2, CardSuit.Spade),
  new TengJia(index++, 2, CardSuit.Club),

  new BaiYinShiZi(index++, 1, CardSuit.Club),

  new Peach(index++, 5, CardSuit.Heart),
  new Peach(index++, 6, CardSuit.Heart),
  new Peach(index++, 2, CardSuit.Diamond),
  new Peach(index++, 3, CardSuit.Diamond),

  new Jink(index++, 8, CardSuit.Heart),
  new Jink(index++, 9, CardSuit.Heart),
  new Jink(index++, 11, CardSuit.Heart),
  new Jink(index++, 12, CardSuit.Heart),
  new Jink(index++, 6, CardSuit.Diamond),
  new Jink(index++, 7, CardSuit.Diamond),
  new Jink(index++, 8, CardSuit.Diamond),
  new Jink(index++, 10, CardSuit.Diamond),
  new Jink(index++, 11, CardSuit.Diamond),

  new WuXieKeJi(index++, 13, CardSuit.Spade),
  new WuXieKeJi(index++, 1, CardSuit.Heart),
  new WuXieKeJi(index++, 13, CardSuit.Heart),

  new ThunderSlash(index++, 4, CardSuit.Spade),
  new ThunderSlash(index++, 5, CardSuit.Spade),
  new ThunderSlash(index++, 6, CardSuit.Spade),
  new ThunderSlash(index++, 7, CardSuit.Spade),
  new ThunderSlash(index++, 8, CardSuit.Spade),
  new ThunderSlash(index++, 6, CardSuit.Club),
  new ThunderSlash(index++, 7, CardSuit.Club),
  new ThunderSlash(index++, 8, CardSuit.Club),

  new FireSlash(index++, 4, CardSuit.Heart),
  new FireSlash(index++, 7, CardSuit.Heart),
  new FireSlash(index++, 10, CardSuit.Heart),
  new FireSlash(index++, 4, CardSuit.Diamond),
  new FireSlash(index++, 5, CardSuit.Diamond),

  new TieSuoLianHuan(index++, 11, CardSuit.Spade),
  new TieSuoLianHuan(index++, 12, CardSuit.Spade),
  new TieSuoLianHuan(index++, 10, CardSuit.Club),
  new TieSuoLianHuan(index++, 11, CardSuit.Club),
  new TieSuoLianHuan(index++, 12, CardSuit.Club),
  new TieSuoLianHuan(index++, 13, CardSuit.Club),

  new HuaLiu(index++, 13, CardSuit.Diamond),
];
