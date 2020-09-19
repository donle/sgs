import { Character } from '../character';
import { CaoCao } from './caocao';
import { CaoZhang } from './caozhang';
import { DaQiao } from './daqiao';
import { DiaoChan } from './diaochan';
import { GanNing } from './ganning';
import { GongSunZan } from './gongsunzan';
import { GuanYu } from './guanyu';
import { GuoJia } from './guojia';
import { HuangGai } from './huanggai';
import { HuangYueYing } from './huangyueying';
import { HuaTuo } from './huatuo';
import { HuaXiong } from './huaxiong';
import { JieXuShu } from './jiexushu';
import { LiDian } from './lidian';
import { LiuBei } from './liubei';
import { LuXun } from './luxun';
import { LvBu } from './lvbu';
import { LvMeng } from './lvmeng';
import { MaChao } from './machao';
import { SiMaYi } from './simayi';
import { SunQuan } from './sunquan';
import { SunShangXiang } from './sunshangxiang';
import { XiaHouDun } from './xiahoudun';
import { XuChu } from './xuchu';
import { YiJi } from './yiji_c';
import { YuanShu } from './yuanshu';
import { ZhangFei } from './zhangfei';
import { ZhangLiao } from './zhangliao';
import { ZhaoYun } from './zhaoyun';
import { ZhenJi } from './zhenji';
import { ZhouYu } from './zhouyu';
import { ZhuGeLiang } from './zhugeliang';

export const StandardCharacterPackage: (index: number) => Character[] = index => [
  new SunQuan(index++),
  new GanNing(index++),
  new LvMeng(index++),
  new HuangGai(index++),
  new ZhouYu(index++),
  new DaQiao(index++),
  new LuXun(index++),
  new SunShangXiang(index++),

  new LiuBei(index++),
  new GuanYu(index++),
  new ZhangFei(index++),
  new ZhuGeLiang(index++),
  new ZhaoYun(index++),
  new MaChao(index++),
  new HuangYueYing(index++),
  new JieXuShu(index++),
  new YiJi(index++),

  new CaoCao(index++),
  new SiMaYi(index++),
  new XiaHouDun(index++),
  new ZhangLiao(index++),
  new XuChu(index++),
  new GuoJia(index++),
  new ZhenJi(index++),
  new LiDian(index++),
  new CaoZhang(index++),

  new HuaTuo(index++),
  new LvBu(index++),
  new DiaoChan(index++),
  new HuaXiong(index++),
  new YuanShu(index++),
  new GongSunZan(index++),
];
