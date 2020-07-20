import { Character } from '../character';
import { ErZhang } from './erzhang';
import { SunCe } from './sunce';

export const MountainCharacterPackage: (index: number) => Character[] = index => [
  new SunCe(index++),
  new ErZhang(index++),
];
