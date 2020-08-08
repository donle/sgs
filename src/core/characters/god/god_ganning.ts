import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class GodGanNing extends Character {
  constructor(id: number) {
    super(id, 'god_ganning', CharacterGender.Male, CharacterNationality.God, 6, 3, GameCharacterExtensions.God, [
      skillLoaderInstance.getSkillByName('poxi'),
      ...skillLoaderInstance.getSkillsByName('jieying'),
    ]);
  }
}
