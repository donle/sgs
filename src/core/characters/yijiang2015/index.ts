import { Character } from '../character';
import { CaoRui } from './caorui';
import { CaoXiu } from './caoxiu';
import { GongSunYuan } from './gongsunyuan';
import { GuoTuPangJi } from './guotupangji';
import { LiuChen } from './liuchen';
import { QuanCong } from './quancong';
import { XiaHouShi } from './xiahoushi';
import { ZhangNi } from './zhangni';
import { ZhongYao } from './zhongyao';
import { ZhuZhi } from './zhuzhi';

export const YiJiang2015Package: (index: number) => Character[] = index => [
  new CaoRui(index++),
  new CaoXiu(index++),
  new ZhongYao(index++),

  new LiuChen(index++),
  new XiaHouShi(index++),
  new ZhangNi(index++),

  new QuanCong(index++),
  new ZhuZhi(index++),

  new GongSunYuan(index++),
  new GuoTuPangJi(index++),
];
