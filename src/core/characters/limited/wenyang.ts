import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLorderInstance = SkillLoader.getInstance();

export class WenYang extends Character {
  constructor(id: number) {
    super(id, 'wenyang', CharacterGender.Male, CharacterNationality.Wei, 5, 5, GameCharacterExtensions.Limited, [
      skillLorderInstance.getSkillByName('lvli'),
      skillLorderInstance.getSkillByName('choujue'),
    ]);
  }
}
