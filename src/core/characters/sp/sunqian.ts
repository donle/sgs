import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLorderInstance = SkillLoader.getInstance();

export class SunQian extends Character {
  constructor(id: number) {
    super(id, 'sunqian', CharacterGender.Male, CharacterNationality.Shu, 3, 3, GameCharacterExtensions.SP, [
      skillLorderInstance.getSkillByName('qianya'),
      skillLorderInstance.getSkillByName('shuimeng'),
    ]);
  }
}
