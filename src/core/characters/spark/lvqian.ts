import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLorderInstance = SkillLoader.getInstance();

export class LvQian extends Character {
  constructor(id: number) {
    super(id, 'lvqian', CharacterGender.Male, CharacterNationality.Wei, 4, 4, GameCharacterExtensions.Spark, [
      ...skillLorderInstance.getSkillsByName('weilu'),
      skillLorderInstance.getSkillByName('zengdao'),
    ]);
  }
}
