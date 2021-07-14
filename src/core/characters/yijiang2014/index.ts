import { Character } from '../character';
import { GuYong } from './guyong';
// import { CaoZhen } from './caozhen';
// import { HanHaoShiHuan } from './hanhaoshihuan';
// import { ChenQun } from './chenqun';
// import { WuYu } from './wuyu';
// import { ZhouChang } from './zhouchang';
// import { ZhangSong } from './zhangsong';
// import { SunLuBan } from './sunluban';
// import { ZhuHuan } from './zhuhuan';
import { YjcmJuShou } from './yjcm_jushou';
// import { CaiFuRen } from './caifuren';

export const YiJiang2014Package: (index: number) => Character[] = index => [
  // new CaoZhen(index++),
  // new HanHaoShiHuan(index++),
  // new ChenQun(index++),
  // new WuYu(index++),
  // new ZhouChang(index++),
  // new ZhangSong(index++),
  // new SunLuBan(index++),
  // new ZhuHuan(index++),
  new YjcmJuShou(index++),
  new GuYong(index++),
  // new CarFuRen(index++),
];
