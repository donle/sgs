import { Character } from '../character';
import { PveBiAn } from './pve_bian';
import { PveBiXi } from './pve_bixi';
import { PveBoss } from './pve_boss';
import { PveChaoFeng } from './pve_chaofeng';
import { PveFuXi } from './pve_fuxi';
import { PveSuanNi } from './pve_suanni';
import { PveYaZi } from './pve_yazi';

export const PvePackage: (index: number) => Character[] = index => [
  new PveBoss(index++),
  new PveSuanNi(index++),
  new PveYaZi(index++),
  new PveBiAn(index++),
  new PveFuXi(index++),
  new PveBiXi(index++),
  new PveChaoFeng(index++),
];
