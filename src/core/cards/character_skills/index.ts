import { QiZhengXiangSheng } from './qizhengxiangsheng';
import { Card } from '../card';
import { CardSuit } from '../libs/card_props';

export const SkillsGeneratedCardPackage: (index: number) => Card[] = index => [
  new QiZhengXiangSheng(index++, 2, CardSuit.Spade),
  new QiZhengXiangSheng(index++, 4, CardSuit.Spade),
  new QiZhengXiangSheng(index++, 6, CardSuit.Spade),
  new QiZhengXiangSheng(index++, 8, CardSuit.Spade),
  new QiZhengXiangSheng(index++, 3, CardSuit.Club),
  new QiZhengXiangSheng(index++, 5, CardSuit.Club),
  new QiZhengXiangSheng(index++, 7, CardSuit.Club),
  new QiZhengXiangSheng(index++, 9, CardSuit.Club),
];
