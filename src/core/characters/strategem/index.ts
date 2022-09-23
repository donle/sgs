import { Character } from '../character';
import { MouHuangZhong } from '../strategem/mou_huangzhong';
import { MouHuaXiong } from './mou_huaxiong';
import { MouLvMeng } from './mou_lvmeng';
import { MouSunQuan } from './mou_sunquan';
import { MouYuJin } from './mou_yujin';

export const StrategemPackage: (index: number) => Character[] = index => [
  new MouYuJin(index++),

  new MouHuangZhong(index++),

  new MouSunQuan(index++),
  new MouLvMeng(index++),

  new MouHuaXiong(index++),
];
