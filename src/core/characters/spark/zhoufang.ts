import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLorderInstance = SkillLoader.getInstance();

export class ZhouFang extends Character {
  constructor(id: number) {
    super(id, 'zhoufang', CharacterGender.Male, CharacterNationality.Wu, 3, 3, GameCharacterExtensions.Spark, [
      ...skillLorderInstance.getSkillsByName('duanfa'),
      skillLorderInstance.getSkillByName('youdi'),
    ]);
  }
}
