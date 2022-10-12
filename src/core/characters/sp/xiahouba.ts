import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLorderInstance = SkillLoader.getInstance();

export class XiaHouBa extends Character {
  constructor(id: number) {
    super(id, 'xiahouba', CharacterGender.Male, CharacterNationality.Shu, 4, 4, GameCharacterExtensions.SP, [
      skillLorderInstance.getSkillByName('baobian'),
    ]);
  }
}
