import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLoaderInstance = SkillLoader.getInstance();

export class CaiWenJi extends Character {
  constructor(id: number) {
    super(id, 'caiwenji', CharacterGender.Female, CharacterNationality.Qun, 3, 3, GameCharacterExtensions.Mountain, [
      skillLoaderInstance.getSkillByName('beige'),
      skillLoaderInstance.getSkillByName('duanchang'),
    ]);
  }
}
