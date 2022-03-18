import { Character } from 'core/characters/character';
import { BaoSanNiang } from './baosanniang';
import { CaoChun } from './caochun';
import { CaoShuang } from './caoshuang';
import { ChenLin } from './chenlin';
import { GeXuan } from './gexuan';
import { GuoZhao } from './guozhao';
import { JiangGan } from './jianggan';
import { LiuBian } from './liubian';
import { LiuZan } from './liuzan';
import { PanShu } from './panshu';
import { RuanYu } from './ruanyu';
import { WangShuang } from './wangshuang';
import { WenYang } from './wenyang';
import { XuRong } from './xurong';
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

  new GeXuan(index++),
  new LiuZan(index++),
  new PanShu(index++),
  new ZhouYi(index++),

  new XuRong(index++),
  new LiuBian(index++),
];
