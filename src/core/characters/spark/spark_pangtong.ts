import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLorderInstance = SkillLoader.getInstance();

export class SparkPangTong extends Character {
  constructor(id: number) {
    super(id, 'spark_pangtong', CharacterGender.Male, CharacterNationality.Wu, 3, 3, GameCharacterExtensions.Spark, [
      skillLorderInstance.getSkillByName('guolun'),
      skillLorderInstance.getSkillByName('songsang'),
    ]);
  }
}
