import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLorderInstance = SkillLoader.getInstance();

export class ZhuGeJin extends Character {
  constructor(id: number) {
    super(id, 'zhugejin', CharacterGender.Male, CharacterNationality.Wu, 3, 3, GameCharacterExtensions.SP, [
      skillLorderInstance.getSkillByName('hongyuan'),
      skillLorderInstance.getSkillByName('huanshi'),
      skillLorderInstance.getSkillByName('mingzhe'),
    ]);
  }
}
