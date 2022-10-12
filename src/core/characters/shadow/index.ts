import { Character } from 'core/characters/character';
import { KuaiYueKuaiLiang } from './kuaiyuekuailiang';
import { LuJi } from './luji';
import { LuZhi } from './luzhi';
import { SunLiang } from './sunliang';
import { WangJi } from './wangji';
import { WangPing } from './wangping';
import { XuYou } from './xuyou';
import { YanYan } from './yanyan';

export const ShadowCharacterPackage: (index: number) => Character[] = index => [
  new WangJi(index++),
  new KuaiYueKuaiLiang(index++),

  new YanYan(index++),
  new WangPing(index++),

  new LuJi(index++),
  new SunLiang(index++),

  new XuYou(index++),
  new LuZhi(index++),
];
