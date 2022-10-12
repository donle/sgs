import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLorderInstance = SkillLoader.getInstance();

export class DuFuRen extends Character {
  constructor(id: number) {
    super(id, 'dufuren', CharacterGender.Female, CharacterNationality.Wei, 3, 3, GameCharacterExtensions.Decade, [
      ...skillLorderInstance.getSkillsByName('yise'),
      ...skillLorderInstance.getSkillsByName('shunshi'),
    ]);
  }
}
