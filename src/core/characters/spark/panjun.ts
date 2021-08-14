import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLorderInstance = SkillLoader.getInstance();

export class PanJun extends Character {
  constructor(id: number) {
    super(id, 'panjun', CharacterGender.Male, CharacterNationality.Wu, 3, 3, GameCharacterExtensions.Spark, [
      skillLorderInstance.getSkillByName('guanwei'),
      skillLorderInstance.getSkillByName('gongqing'),
    ]);
  }
}
