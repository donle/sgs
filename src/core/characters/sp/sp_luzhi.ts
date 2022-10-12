import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLorderInstance = SkillLoader.getInstance();

export class SPLuZhi extends Character {
  constructor(id: number) {
    super(id, 'sp_luzhi', CharacterGender.Male, CharacterNationality.Wei, 3, 3, GameCharacterExtensions.SP, [
      ...skillLorderInstance.getSkillsByName('qingzhong'),
      skillLorderInstance.getSkillByName('weijing'),
    ]);
  }
}
