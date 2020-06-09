import { Card } from '../card';
import { CardSuit } from '../libs/card_props';
import { BaiYinShiZi } from './baiyinshizi';
import { BingLiangCunDuan } from './bingliangcunduan';
import { HuoGong } from './huogong';
import { TengJia } from './tengjia';

export const LegionFightCardPackage: (index: number) => Card[] = index => [
  new HuoGong(index++, 2, CardSuit.Heart),
  new HuoGong(index++, 3, CardSuit.Heart),
  new HuoGong(index++, 12, CardSuit.Diamond),

  new BingLiangCunDuan(index++, 10, CardSuit.Spade),
  new BingLiangCunDuan(index++, 4, CardSuit.Club),

  new TengJia(index++, 2, CardSuit.Spade),
  new TengJia(index++, 2, CardSuit.Club),

  new BaiYinShiZi(index++, 1, CardSuit.Club),
];
