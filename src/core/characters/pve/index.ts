import { Character } from '../character';
import { GuanSuo } from '../limited/guansuo';
import { PveLongShen } from './pve_longshen';
import { PveLianZhen, PveQiSha, PveSoldier, PveTianJi, PveTianLiang, PveTianTong, PveTianXiang } from './pve_soldier';

export const PvePackage: (index: number) => Character[] = index => [
  new PveLongShen(index++),

  new PveSoldier(index++),
  new PveQiSha(index++),
  new PveTianJi(index++),
  new PveTianLiang(index++),
  new PveTianTong(index++),
  new PveTianXiang(index++),
  new PveLianZhen(index++),

  new GuanSuo(index++),
];
