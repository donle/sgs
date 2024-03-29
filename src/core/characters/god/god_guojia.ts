import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();
export class GodGuoJia extends Character {
  constructor(id: number) {
    super(id, 'god_guojia', CharacterGender.Male, CharacterNationality.God, 3, 3, GameCharacterExtensions.God, [
      skillLoaderInstance.getSkillByName('god_huishi'),
      skillLoaderInstance.getSkillByName('god_tianyi'),
      skillLoaderInstance.getSkillByName('god_huishi_sec'),
    ]);
  }
}
