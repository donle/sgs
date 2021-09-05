import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLorderInstance = SkillLoader.getInstance();

export class YangXiu extends Character {
  constructor(id: number) {
    super(id, 'yangxiu', CharacterGender.Male, CharacterNationality.Wei, 3, 3, GameCharacterExtensions.SP, [
      skillLorderInstance.getSkillByName('danlao'),
      skillLorderInstance.getSkillByName('jilei'),
      skillLorderInstance.getSkillByName('god_huishi'),
    ]);
  }
}
