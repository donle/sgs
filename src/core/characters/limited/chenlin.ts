import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLorderInstance = SkillLoader.getInstance();

export class ChenLin extends Character {
  constructor(id: number) {
    super(id, 'chenlin', CharacterGender.Male, CharacterNationality.Wei, 3, 3, GameCharacterExtensions.Limited, [
      skillLorderInstance.getSkillByName('bifa'),
      ...skillLorderInstance.getSkillsByName('songci'),
    ]);
  }
}
