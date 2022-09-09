import { Character } from 'core/characters/character';
import { CaiZhenJi } from './caizhenji';
import { LiuZhang } from './liuzhang';
import { RenXuJing } from './ren_xujing';
import { XiangChong } from './xiangchong';

export const BenevolencePackage: (index: number) => Character[] = index => [
  new CaiZhenJi(index++),

  new RenXuJing(index++),
  //new XiangChong(index++),

  new LiuZhang(index++),
];
