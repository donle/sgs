import { BeiMiHu } from './beimihu';
import { CaoAng } from './caoang';
import { CaoHong } from './caohong';
import { DingFeng } from './dingfeng';
import { DongYun } from './dongyun';
import { FuWan } from './fuwan';
import { GuanYinPing } from './guanyinping';
import { HeQi } from './heqi';
import { HuangZu } from './huangzu';
import { LiTong } from './litong';
import { LiuQi } from './liuqi';
import { LiuXie } from './liuxie';
import { MaLiang } from './maliang';
import { MaYunLu } from './mayunlu';
import { MaZhong } from './mazhong';
import { MiZhu } from './mizhu';
import { OLZhuLing } from './ol_zhuling';
import { QuYi } from './quyi';
import { ShaMoKe } from './shamoke';
import { ShiXie } from './shixie';
import { SiMaLang } from './simalang';
import { SPCaiWenJi } from './sp_caiwenji';
import { SPCaoRen } from './sp_caoren';
import { SPDiaochan } from './sp_diaochan';
import { SPHuangYueYing } from './sp_huangyueying';
import { SPJiangWei } from './sp_jiangwei';
import { SPLuZhi } from './sp_luzhi';
import { SPMaChao } from './sp_machao';
import { SPPangDe } from './sp_pangde';
import { SPSunShangXiang } from './sp_sunshangxiang';
import { SPZhaoYun } from './sp_zhaoyun';
import { SunHao } from './sunhao';
import { SunQian } from './sunqian';
import { WenPin } from './wenpin';
import { WuTuGu } from './wutugu';
import { XiaHouBa } from './xiahouba';
import { XiZhiCai } from './xizhicai';
import { XSPLiuBei } from './xsp_liubei';
import { XuJing } from './xujing';
import { YangXiu } from './yangxiu';
import { YueJin } from './yuejin';
import { ZhangBao } from './zhangbao';
import { ZhangLiang } from './zhangliang';
import { ZhangLing } from './zhangling';
import { ZhouQun } from './zhouqun';
import { ZhuGeDan } from './zhugedan';
import { ZuMao } from './zumao';
import { Character } from 'core/characters/character';

export const SpPackage: (index: number) => Character[] = index => [
  new YangXiu(index++),
  new SPCaiWenJi(index++),
  new SPJiangWei(index++),
  new SPPangDe(index++),
  new SPCaoRen(index++),
  new CaoHong(index++),
  new YueJin(index++),
  new CaoAng(index++),
  new WenPin(index++),
  new ZhuGeDan(index++),
  new LiTong(index++),
  new SiMaLang(index++),
  new XiZhiCai(index++),
  new SPLuZhi(index++),
  new OLZhuLing(index++),

  new GuanYinPing(index++),
  new XiaHouBa(index++),
  new SPSunShangXiang(index++),
  new MaYunLu(index++),
  new SunQian(index++),
  new MiZhu(index++),
  new MaLiang(index++),
  new MaZhong(index++),
  new ZhouQun(index++),
  new DongYun(index++),
  new ShaMoKe(index++),
  new XuJing(index++),

  new SunHao(index++),
  new ZuMao(index++),
  new DingFeng(index++),
  new HeQi(index++),

  new SPZhaoYun(index++),
  new FuWan(index++),
  new LiuXie(index++),
  new SPMaChao(index++),
  new SPHuangYueYing(index++),
  new ZhangBao(index++),
  new ShiXie(index++),
  new ZhangLiang(index++),
  new QuYi(index++),
  new LiuQi(index++),
  new ZhangLing(index++),
  new WuTuGu(index++),
  new SPDiaochan(index++),
  new BeiMiHu(index++),
  new HuangZu(index++),
  new XSPLiuBei(index++),
];
