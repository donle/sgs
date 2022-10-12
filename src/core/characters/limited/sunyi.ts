import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLorderInstance = SkillLoader.getInstance();

export class SunYi extends Character {
  constructor(id: number) {
    super(id, 'sunyi', CharacterGender.Male, CharacterNationality.Wu, 5, 5, GameCharacterExtensions.Limited, [
      ...skillLorderInstance.getSkillsByName('sunyi_jiqiao'),
      skillLorderInstance.getSkillByName('xiongyi'),
    ]);
  }
}
