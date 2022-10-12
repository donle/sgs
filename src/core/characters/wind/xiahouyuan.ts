import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class XiaHouYuan extends Character {
  constructor(id: number) {
    super(id, 'xiahouyuan', CharacterGender.Male, CharacterNationality.Wei, 4, 4, GameCharacterExtensions.Wind, [
      skillLoaderInstance.getSkillByName('shensu'),
      skillLoaderInstance.getSkillByName('shebian'),
    ]);
  }
}
