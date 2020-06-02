import { Character } from '../character';
import { CaoRen } from './caoren';
import { HuangZhong } from './huangzhong';
import { Weiyan } from './weiyan';
import { XiaHouYuan } from './xiahouyuan';
import { XiaoQiao } from './xiaoqiao';
import { YuJi } from './yuji';
import { ZhangJiao } from './zhangjiao';
import { ZhouTai } from './zhoutai';

export const WindCharacterPackage: (index: number) => Character[] = index => [
  new CaoRen(index++),
  new XiaHouYuan(index++),

  new Weiyan(index++),
  new HuangZhong(index++),

  new ZhouTai(index++),
  new YuJi(index++),
  new ZhangJiao(index++),
  new XiaoQiao(index++),
];
