import { Character } from 'core/characters/character';
import { DongYun } from './dongyun';
import { FuWan } from './fuwan';
import { HuangZu } from './huangzu';
import { LiuQi } from './liuqi';
import { MaLiang } from './maliang';
import { MaYunLu } from './mayunlu';
import { MaZhong } from './mazhong';
import { QuYi } from './quyi';
import { ShaMoKe } from './shamoke';
import { ShiXie } from './shixie';
import { SPCaiWenJi } from './sp_caiwenji';
import { SPJiangWei } from './sp_jiangwei';
import { SPSunShangXiang } from './sp_sunshangxiang';
import { SPZhaoYun } from './sp_zhaoyun';
import { SunHao } from './sunhao';
import { WuTuGu } from './wutugu';
import { YangXiu } from './yangxiu';
import { ZhangLing } from './zhangling';
import { ZhouQun } from './zhouqun';

export const SPPackage: (index: number) => Character[] = index => [
  new YangXiu(index++),
  new SPCaiWenJi(index++),
  new SPJiangWei(index++),

  new SPSunShangXiang(index++),
  new MaYunLu(index++),
  new MaLiang(index++),
  new MaZhong(index++),
  new ZhouQun(index++),
  new DongYun(index++),
  new ShaMoKe(index++),

  new SunHao(index++),

  new SPZhaoYun(index++),
  new FuWan(index++),
  new ShiXie(index++),
  new QuYi(index++),
  new LiuQi(index++),
  new ZhangLing(index++),
  new WuTuGu(index++),
  new HuangZu(index++),
];
