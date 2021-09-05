import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class GuoTuPangJi extends Character {
  constructor(id: number) {
    super(id, 'guotupangji', CharacterGender.Male, CharacterNationality.Qun, 3, 3, GameCharacterExtensions.YiJiang2015, [
      ...skillLoaderInstance.getSkillsByName('jigong'),
      skillLoaderInstance.getSkillByName('shifei'),
    ]);
  }
}
