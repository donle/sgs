import { Character } from '../character';
import { CaoZhi } from './caozhi';
import { ChenGong } from './chengong';
import { FaZheng } from './fazheng';
import { GaoShun } from './gaoshun';
import { LingTong } from './lingtong';
import { MaSu } from './masu';
import { WuGuoTai } from './wuguotai';
import { XuSheng } from './xusheng';
import { XuShu } from './xushu';
import { YuJin } from './yujin';
import { ZhangChunHua } from './zhangchunhua';

export const YiJiang2011Package: (index: number) => Character[] = index => [
  new CaoZhi(index++),
  new ZhangChunHua(index++),
  new YuJin(index++),

  new FaZheng(index++),
  new MaSu(index++),
  new XuShu(index++),

  new XuSheng(index++),
  new WuGuoTai(index++),
  new LingTong(index++),

  new ChenGong(index++),
  new GaoShun(index++),
];
