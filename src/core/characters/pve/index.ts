import { Character } from '../character';
import { PveChaoFeng } from './pve_chaofeng';
import { PveSuanNi } from './pve_suanni';
import { PveYaZi } from './pve_yazi';
import { PveBiAn } from './pve_bian';
import { PveFuXi } from './pve_fuxi';
import { PveBiXi } from './pve_bixi';

export const PvePackage: (index: number) => Character[] = index => [
  new PveChaoFeng(index++),
  new PveSuanNi(index++),
  new PveYaZi(index++),
  new PveBiAn(index++),
  new PveFuXi(index++),
  new PveBiXi(index++),
];
