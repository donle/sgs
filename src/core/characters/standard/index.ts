import { Character } from '../character';
import { CaoCao } from './caocao';
import { DaQiao } from './daqiao';
import { DiaoChan } from './diaochan';
import { GanNing } from './ganning';
import { GuoJia } from './guojia';
import { HuangGai } from './huanggai';
import { HuangYueYing } from './huangyueying';
import { LiuBei } from './liubei';
import { LvMeng } from './lvmeng';
import { MaChao } from './machao';
import { SiMaYi } from './simayi';
import { SunQuan } from './sunquan';
import { SunShangXiang } from './sunshangxiang';
import { XiaHouDun } from './xiahoudun';
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

  new LiuBei(index++),
  new HuangYueYing(index++),
  new ZhuGeLiang(index++),
  new ZhaoYun(index++),
  new MaChao(index++),

  new CaoCao(index++),
  new SiMaYi(index++),
  new GuoJia(index++),
  new ZhangLiao(index++),
  new ZhenJi(index++),
  new XiaHouDun(index++),

  new DiaoChan(index++),
];
