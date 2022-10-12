import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLorderInstance = SkillLoader.getInstance();

export class HeQi extends Character {
  constructor(id: number) {
    super(id, 'heqi', CharacterGender.Male, CharacterNationality.Wu, 4, 4, GameCharacterExtensions.SP, [
      skillLorderInstance.getSkillByName('qizhou'),
      ...skillLorderInstance.getSkillsByName('shanxi'),
    ]);
  }
}
