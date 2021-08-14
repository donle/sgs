import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class KongRong extends Character {
  constructor(id: number) {
    super(id, 'kongrong', CharacterGender.Male, CharacterNationality.Qun, 3, 3, GameCharacterExtensions.Sincerity, [
      skillLoaderInstance.getSkillByName('mingshi'),
      skillLoaderInstance.getSkillByName('lirang'),
    ]);
  }
}
