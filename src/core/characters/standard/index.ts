import { Character } from '../character';
import { CaoCao } from './caocao';
import { HuangYueYing } from './huangyueying';
import { LiuBei } from './liubei';
import { SunQuan } from './sunquan';

export const StandardCharacterPackage: (index: number) => Character[] = index => [
  new SunQuan(index++),
  new LiuBei(index++),
  new CaoCao(index++),
  new HuangYueYing(index++),
];
