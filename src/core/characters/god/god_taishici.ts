import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLoaderInstance = SkillLoader.getInstance();

export class GodTaiShiCi extends Character {
  constructor(id: number) {
    super(id, 'god_taishici', CharacterGender.Male, CharacterNationality.God, 4, 4, GameCharacterExtensions.God, [
      skillLoaderInstance.getSkillByName('dulie'),
      ...skillLoaderInstance.getSkillsByName('powei'),
    ]);
  }
}
