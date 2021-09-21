import { Character } from 'core/characters/character';
import { DongYun } from './dongyun';
import { FuWan } from './fuwan';
import { HuangZu } from './huangzu';
import { LiuQi } from './liuqi';
import { LiuXie } from './liuxie';
import { MaLiang } from './maliang';
import { MaYunLu } from './mayunlu';
import { MaZhong } from './mazhong';
import { MiZhu } from './mizhu';
import { QuYi } from './quyi';
import { ShaMoKe } from './shamoke';
import { ShiXie } from './shixie';
import { SPCaiWenJi } from './sp_caiwenji';
import { SPDiaochan } from './sp_diaochan';
import { SPHuangYueYing } from './sp_huangyueying';
import { SPJiangWei } from './sp_jiangwei';
import { SPPangDe } from './sp_pangde';
import { SPSunShangXiang } from './sp_sunshangxiang';
import { SPZhaoYun } from './sp_zhaoyun';
import { SunHao } from './sunhao';
import { SunQian } from './sunqian';
import { WuTuGu } from './wutugu';
import { XiZhiCai } from './xizhicai';
import { YangXiu } from './yangxiu';
import { ZhangBao } from './zhangbao';
import { ZhangLiang } from './zhangliang';
import { ZhangLing } from './zhangling';
import { ZhouQun } from './zhouqun';
import { ZhuGeDan } from './zhugedan';

export const SPPackage: (index: number) => Character[] = index => [
  new YangXiu(index++),
  new SPCaiWenJi(index++),
  new SPJiangWei(index++),
  new SPPangDe(index++),
  new ZhuGeDan(index++),
  new XiZhiCai(index++),

  new SPSunShangXiang(index++),
  new MaYunLu(index++),
  new SunQian(index++),
  new MiZhu(index++),
  new MaLiang(index++),
  new MaZhong(index++),
  new ZhouQun(index++),
  new DongYun(index++),
  new ShaMoKe(index++),

  new SunHao(index++),

  new SPZhaoYun(index++),
  new FuWan(index++),
  new LiuXie(index++),
  new SPHuangYueYing(index++),
  new ZhangBao(index++),
  new ShiXie(index++),
  new ZhangLiang(index++),
  new QuYi(index++),
  new LiuQi(index++),
  new ZhangLing(index++),
  new WuTuGu(index++),
  new SPDiaochan(index++),
  new HuangZu(index++),
];
