import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLorderInstance = SkillLoader.getInstance();

export class HuaXin extends Character {
  constructor(id: number) {
    super(id, 'huaxin', CharacterGender.Male, CharacterNationality.Wei, 3, 3, GameCharacterExtensions.Decade, [
      ...skillLorderInstance.getSkillsByName('wanggui'),
      skillLorderInstance.getSkillByName('xibing'),
    ]);
  }
}
