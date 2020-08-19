import { Character } from '../character';
import { CaoZhi } from './caozhi';
import { ChenGong } from './chengong';
import { FaZheng } from './fazheng';
import { MaSu } from './masu';
import { XuSheng } from './xusheng';
import { XuShu } from './xushu';
import { ZhangChunHua } from './zhangchunhua';

export const YiJiang2011Package: (index: number) => Character[] = index => [
  new CaoZhi(index++),
  new ZhangChunHua(index++),

  new FaZheng(index++),
  new MaSu(index++),
  new XuShu(index++),

  new XuSheng(index++),

  new ChenGong(index++),
];
