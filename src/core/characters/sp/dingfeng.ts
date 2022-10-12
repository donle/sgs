import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLorderInstance = SkillLoader.getInstance();

export class DingFeng extends Character {
  constructor(id: number) {
    super(id, 'dingfeng', CharacterGender.Male, CharacterNationality.Wu, 4, 4, GameCharacterExtensions.SP, [
      ...skillLorderInstance.getSkillsByName('duanbing'),
      ...skillLorderInstance.getSkillsByName('fenxun'),
    ]);
  }
}
