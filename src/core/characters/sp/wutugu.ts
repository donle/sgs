import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLorderInstance = SkillLoader.getInstance();

export class WuTuGu extends Character {
  constructor(id: number) {
    super(id, 'wutugu', CharacterGender.Male, CharacterNationality.Qun, 15, 15, GameCharacterExtensions.SP, [
      skillLorderInstance.getSkillByName('ranshang'),
      skillLorderInstance.getSkillByName('hanyong'),
    ]);
  }
}
