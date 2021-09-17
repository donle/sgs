import { Character } from 'core/characters/character';
import { CaoChun } from './caochun';
import { CaoShuang } from './caoshuang';
import { GeXuan } from './gexuan';
import { GuoZhao } from './guozhao';
import { JiangGan } from './jianggan';
import { LiuZan } from './liuzan';
import { RuanYu } from './ruanyu';
import { WangShuang } from './wangshuang';
import { XuRong } from './xurong';
import { ZhuGeGuo } from './zhugeguo';

export const LimitedPackage: (index: number) => Character[] = index => [
  new CaoChun(index++),
  new JiangGan(index++),
  new CaoShuang(index++),
  new WangShuang(index++),
  new GuoZhao(index++),
  new RuanYu(index++),

  new GeXuan(index++),
  new LiuZan(index++),

  new ZhuGeGuo(index++),

  new XuRong(index++),
];
