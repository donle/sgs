import { Character } from '../character';
import { ChenDao } from './chendao';
import { GuanQiuJian } from './guanqiujian';
import { HaoZhao } from './haozhao';
import { LeiYuanShu } from './lei_yuanshu';
import { LuKang } from './lukang';
import { ZhangXiu } from './zhangxiu';
import { ZhouFei } from './zhoufei';
import { ZhuGeZhan } from './zhugezhan';

export const ThunderCharacterPackage: (index: number) => Character[] = index => [
  new HaoZhao(index++),
  new GuanQiuJian(index++),

  new ChenDao(index++),
  new ZhuGeZhan(index++),

  new LuKang(index++),
  new ZhouFei(index++),

  new LeiYuanShu(index++),
  new ZhangXiu(index++),
];
