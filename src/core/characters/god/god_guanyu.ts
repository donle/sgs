import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class GodGuanYu extends Character {
  constructor(id: number) {
    super(id, 'god_guanyu', CharacterGender.Male, CharacterNationality.God, 5, 5, GameCharacterExtensions.God, [
      ...skillLoaderInstance.getSkillsByName('wushen'),
      ...skillLoaderInstance.getSkillsByName('wuhun'),
    ]);
  }
}
