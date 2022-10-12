import { CaiFuRen } from './caifuren';
import { CaoZhen } from './caozhen';
import { ChenQun } from './chenqun';
import { GuYong } from './guyong';
import { HanHaoShiHuan } from './hanhaoshihuan';
import { SunLuBan } from './sunluban';
import { WuYi } from './wuyi';
import { YjcmJuShou } from './yjcm_jushou';
import { ZhangSong } from './zhangsong';
import { ZhouCang } from './zhoucang';
import { ZhuHuan } from './zhuhuan';
import { Character } from '../character';

export const YiJiang2014Package: (index: number) => Character[] = index => [
  new CaoZhen(index++),
  new HanHaoShiHuan(index++),
  new ChenQun(index++),

  new WuYi(index++),
  new ZhangSong(index++),
  new ZhouCang(index++),

  new GuYong(index++),
  new SunLuBan(index++),
  new ZhuHuan(index++),

  new YjcmJuShou(index++),
  new CaiFuRen(index++),
];
