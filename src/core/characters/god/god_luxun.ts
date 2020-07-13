import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class GodLuXun extends Character {
  constructor(id: number) {
    super(id, 'god_luxun', CharacterGender.Male, CharacterNationality.God, 4, 4, GameCharacterExtensions.God, [
      skillLoaderInstance.getSkillByName('junlve'),
      skillLoaderInstance.getSkillByName('cuike'),
      skillLoaderInstance.getSkillByName('zhanhuo'),
    ]);
  }
}
