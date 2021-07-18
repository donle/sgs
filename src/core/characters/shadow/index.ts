import { Character } from 'core/characters/character';
import { LuJi } from './luji';
import { WangJi } from './wangji';
import { XuYou } from './xuyou';

export const ShadowCharacterPackage: (index: number) => Character[] = index => [
  new WangJi(index++),

  new LuJi(index++),

  new XuYou(index++),
];
