import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLorderInstance = SkillLoader.getInstance();

export class BaoSanNiang extends Character {
  constructor(id: number) {
    super(id, 'baosanniang', CharacterGender.Female, CharacterNationality.Shu, 3, 3, GameCharacterExtensions.Limited, [
      skillLorderInstance.getSkillByName('wuniang'),
      ...skillLorderInstance.getSkillsByName('xushen'),
    ]);
  }
}
