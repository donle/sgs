import { Character } from 'core/characters/character';
import { CaoSong } from './caosong';
import { WangRong } from './wangrong';
import { XuShao } from './xushao';

export const BiographiesPackage: (index: number) => Character[] = index => [
  new CaoSong(index++),

  new XuShao(index++),
  new WangRong(index++),
];
