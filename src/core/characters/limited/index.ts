import { Character } from 'core/characters/character';
import { BaoSanNiang } from './baosanniang';
import { CaoChun } from './caochun';
import { CaoShuang } from './caoshuang';
import { ChenLin } from './chenlin';
import { DecadeLuoTong } from './decade_luotong';
import { FanYuFeng } from './fanyufeng';
import { FengYu } from './fengyu';
import { GeXuan } from './gexuan';
import { GuoZhao } from './guozhao';
import { JiangGan } from './jianggan';
import { LiuBian } from './liubian';
import { NewLiuZan } from './new_liuzan';
import { PanShu } from './panshu';
import { RuanYu } from './ruanyu';
import { SunYi } from './sunyi';
import { WangShuang } from './wangshuang';
import { WenYang } from './wenyang';
import { XuRong } from './xurong';
import { YangWan } from './yangwan';
import { ZhouYi } from './zhouyi';
import { ZhuGeGuo } from './zhugeguo';

export const LimitedPackage: (index: number) => Character[] = index => [
  new ChenLin(index++),
  new CaoChun(index++),
  new JiangGan(index++),
  new CaoShuang(index++),
  new WangShuang(index++),
  new GuoZhao(index++),
  new RuanYu(index++),
  new WenYang(index++),

  new ZhuGeGuo(index++),
  new BaoSanNiang(index++),
  new YangWan(index++),

  new GeXuan(index++),
  new NewLiuZan(index++),
  new PanShu(index++),
  new ZhouYi(index++),
  new SunYi(index++),
  new DecadeLuoTong(index++),

  new XuRong(index++),
  new LiuBian(index++),
  new FanYuFeng(index++),
  new FengYu(index++),
];
