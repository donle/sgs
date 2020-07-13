import { Character } from '../character';
import { CaoPi } from './caopi';
import { DongZhuo } from './dongzhuo';
import { JiaXu } from './jiaxu';
import { Lusu } from './lusu';
import { MengHuo } from './menghuo';
import { SunJian } from './sunjian';
import { XuHuang } from './xuhuang';
import { ZhuRong } from './zhurong';

export const ForestCharacterPackage: (index: number) => Character[] = index => [
  new CaoPi(index++),
  new XuHuang(index++),

  new MengHuo(index++),
  new ZhuRong(index++),

  new SunJian(index++),
  new Lusu(index++),

  new DongZhuo(index++),
  new JiaXu(index++),
];
