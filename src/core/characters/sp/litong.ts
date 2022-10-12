import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLorderInstance = SkillLoader.getInstance();

export class LiTong extends Character {
  constructor(id: number) {
    super(id, 'litong', CharacterGender.Male, CharacterNationality.Wei, 4, 4, GameCharacterExtensions.SP, [
      ...skillLorderInstance.getSkillsByName('tuifeng'),
    ]);
  }
}
