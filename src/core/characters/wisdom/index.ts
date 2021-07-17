import { Character } from 'core/characters/character';
import { BianFuRen } from './bianfuren';
import { ChenZhen } from './chenzhen';
import { FeiYi } from './feiyi';
import { LuoTong } from './luotong';
import { ZhiDuYu } from './zhi_duyu';
import { ZhiWangCan } from './zhi_wangcan';
import { ZhiXunChen } from './zhi_xunchen';

export const WisdomPackage: (index: number) => Character[] = index => [
  new ZhiWangCan(index++),
  new BianFuRen(index++),

  new ChenZhen(index++),
  new FeiYi(index++),

  new LuoTong(index++),

  new ZhiXunChen(index++),
  new ZhiDuYu(index++),
];
