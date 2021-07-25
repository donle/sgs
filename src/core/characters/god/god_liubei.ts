import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class GodLiuBei extends Character {
  constructor(id: number) {
    super(id, 'god_liubei', CharacterGender.Male, CharacterNationality.God, 6, 6, GameCharacterExtensions.God, [
      ...skillLoaderInstance.getSkillsByName('longnu'),
      ...skillLoaderInstance.getSkillsByName('liu_jieying'),
    ]);
  }
}
