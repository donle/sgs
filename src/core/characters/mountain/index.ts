import { Character } from '../character';
import { SunCe } from './sunce';

export const MountainCharacterPackage: (index: number) => Character[] = index => [
  new SunCe(index++),
];
