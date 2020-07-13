import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class XuHuang extends Character {
  constructor(id: number) {
    super(id, 'xuhuang', CharacterGender.Male, CharacterNationality.Wei, 4, 4, GameCharacterExtensions.Forest, [
      ...skillLoaderInstance.getSkillsByName('duanliang'),
      skillLoaderInstance.getSkillByName('jiezi'),
    ]);
  }
}
