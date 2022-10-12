import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLorderInstance = SkillLoader.getInstance();

export class YanJun extends Character {
  constructor(id: number) {
    super(id, 'yanjun', CharacterGender.Male, CharacterNationality.Wu, 3, 3, GameCharacterExtensions.Spark, [
      ...skillLorderInstance.getSkillsByName('guanchao'),
      skillLorderInstance.getSkillByName('xunxian'),
    ]);
  }
}
