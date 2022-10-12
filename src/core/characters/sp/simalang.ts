import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLorderInstance = SkillLoader.getInstance();

export class SiMaLang extends Character {
  constructor(id: number) {
    super(id, 'simalang', CharacterGender.Male, CharacterNationality.Wei, 3, 3, GameCharacterExtensions.SP, [
      skillLorderInstance.getSkillByName('junbing'),
      skillLorderInstance.getSkillByName('quji'),
    ]);
  }
}
