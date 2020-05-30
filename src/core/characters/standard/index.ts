import { Character } from '../character';
import { CaoCao } from './caocao';
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
import { ZhangFei } from './zhangfei';
import { ZhangLiao } from './zhangliao';
import { ZhaoYun } from './zhaoyun';
import { ZhenJi } from './zhenji';
import { ZhouYu } from './zhouyu';
import { ZhuGeLiang } from './zhugeliang';

export const StandardCharacterPackage: (index: number) => Character[] = index => [
  new SunQuan(index++),
  new ZhouYu(index++),
  new SunShangXiang(index++),
  new HuangGai(index++),
  new LvMeng(index++),
  new DaQiao(index++),
  new GanNing(index++),
  new LuXun(index++),

  new LiuBei(index++),
  new HuangYueYing(index++),
  new ZhuGeLiang(index++),
  new ZhaoYun(index++),
  new MaChao(index++),
  new ZhangFei(index++),
  new GuanYu(index++),
  new YiJi(index++),

  new CaoCao(index++),
  new SiMaYi(index++),
  new GuoJia(index++),
  new ZhangLiao(index++),
  new ZhenJi(index++),
  new XiaHouDun(index++),
  new XuChu(index++),
  new LiDian(index++),

  new DiaoChan(index++),
  new GongSunZan(index++),
  new HuaTuo(index++),
  new HuaXiong(index++),
  new LvBu(index++),
];
