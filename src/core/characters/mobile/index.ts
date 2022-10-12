import { DengZhi } from './dengzhi';
import { FuQian } from './fuqian';
import { GongSunKang } from './gongsunkang';
import { HuJinDing } from './hujinding';
import { JiaKui } from './jiakui';
import { LiFeng } from './lifeng';
import { LingCao } from './lingcao';
import { LiuZan } from './liuzan';
import { MaoJie } from './maojie';
import { MaYuanYi } from './mayuanyi';
import { MobileFuRong } from './mobile_furong';
import { MobileSuFei } from './mobile_sufei';
import { SiMaShi } from './simashi';
import { SiMaZhao } from './simazhao';
import { SunRu } from './sunru';
import { WangYuanJi } from './wangyuanji';
import { XingGanNing } from './xing_ganning';
import { XingHuangZhong } from './xing_huangzhong';
import { YangBiao } from './yangbiao';
import { YangHuiYu } from './yanghuiyu';
import { YanPu } from './yanpu';
import { ZhuLing } from './zhuling';
import { Character } from '../character';

export const MobilePackage: (index: number) => Character[] = index => [
  new ZhuLing(index++),
  new SiMaZhao(index++),
  new WangYuanJi(index++),
  new JiaKui(index++),
  new SiMaShi(index++),
  new YangHuiYu(index++),
  new MaoJie(index++),

  new LiFeng(index++),
  new DengZhi(index++),
  new MobileFuRong(index++),
  new HuJinDing(index++),
  new FuQian(index++),

  new LingCao(index++),
  new SunRu(index++),
  new LiuZan(index++),

  new YangBiao(index++),
  new MobileSuFei(index++),
  new XingGanNing(index++),
  new GongSunKang(index++),
  new MaYuanYi(index++),
  new YanPu(index++),
  new XingHuangZhong(index++),
];
