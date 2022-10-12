import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLorderInstance = SkillLoader.getInstance();

export class WuTuGu extends Character {
  constructor(id: number) {
    super(id, 'wutugu', CharacterGender.Male, CharacterNationality.Qun, 15, 15, GameCharacterExtensions.SP, [
      skillLorderInstance.getSkillByName('ranshang'),
      skillLorderInstance.getSkillByName('hanyong'),
    ]);
  }
}
