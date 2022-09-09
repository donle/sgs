import { Character } from 'core/characters/character';
import { CaiMaoZhangYun } from './caimaozhangyun';
import { CaoXing } from './caoxing';
import { DecadeDengZhi } from './decade_dengzhi';
import { DecadeHuangChengYan } from './decade_huangchengyan';
import { DecadeLiuBa } from './decade_liuba';
import { DecadeMiHeng } from './decade_miheng';
import { DuanWei } from './duanwei';
import { DuFuRen } from './dufuren';
import { FanChou } from './fanchou';
import { FengXi } from './fengxi';
import { GuoSi } from './guosi';
import { HuaXin } from './huaxin';
import { LiangXing } from './liangxing';
import { LiCaiWei } from './licaiwei';
import { LiJue } from './lijue';
import { LuYuSheng } from './luyusheng';
import { LvLingQi } from './lvlingqi';
import { MaMiDi } from './mamidi';
import { MiFangFuShiRen } from './mifangfushiren';
import { NiuJin } from './niujin';
import { PanFeng } from './panfeng';
import { TongYuanC } from './tongyuan';
import { WanNianGongZhu } from './wanniangongzhu';
import { XiaHouJie } from './xiahoujie';
import { XingDaoRong } from './xingdaorong';
import { XuGong } from './xugong';
import { XunChen } from './xunchen';
import { ZhangHeng } from './zhangheng';
import { ZhangHu } from './zhanghu';
import { ZhangJi } from './zhangji';
import { ZhangWen } from './zhangwen';
import { ZhaoZhong } from './zhaozhong';

export const DecadePackage: (index: number) => Character[] = index => [
  new NiuJin(index++),
  new HuaXin(index++),
  new ZhangHu(index++),
  new DuFuRen(index++),
  new XiaHouJie(index++),
  new CaiMaoZhangYun(index++),

  new DecadeDengZhi(index++),
  new MiFangFuShiRen(index++),
  new DecadeLiuBa(index++),

  new XuGong(index++),
  new ZhangWen(index++),
  new LuYuSheng(index++),
  new FengXi(index++),

  new LiJue(index++),
  new GuoSi(index++),
  new FanChou(index++),
  new ZhangJi(index++),
  new LiangXing(index++),
  new DuanWei(index++),
  new ZhangHeng(index++),
  new PanFeng(index++),
  new XingDaoRong(index++),
  new CaoXing(index++),
  new ZhaoZhong(index++),
  new TongYuanC(index++),
  new WanNianGongZhu(index++),
  new XunChen(index++),
  new LvLingQi(index++),
  new DecadeMiHeng(index++),
  new LiCaiWei(index++),
  new MaMiDi(index++),
  //new DecadeHuangChengYan(index++),
];
