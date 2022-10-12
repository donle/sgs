import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLorderInstance = SkillLoader.getInstance();

export class LvDai extends Character {
  constructor(id: number) {
    super(id, 'lvdai', CharacterGender.Male, CharacterNationality.Wu, 4, 4, GameCharacterExtensions.Spark, [
      ...skillLorderInstance.getSkillsByName('qinguo'),
    ]);
  }
}
