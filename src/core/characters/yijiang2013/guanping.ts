import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class GuanPing extends Character {
  constructor(id: number) {
    super(id, 'guanping', CharacterGender.Male, CharacterNationality.Shu, 4, 4, GameCharacterExtensions.YiJiang2013, [
      ...skillLoaderInstance.getSkillsByName('longyin'),
      skillLoaderInstance.getSkillByName('jiezhong'),
    ]);
  }
}
