import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLoaderInstance = SkillLoader.getInstance();

export class DiaoChan extends Character {
  constructor(id: number) {
    super(id, 'diaochan', CharacterGender.Female, CharacterNationality.Qun, 3, 3, GameCharacterExtensions.Standard, [
      skillLoaderInstance.getSkillByName('lijian'),
      skillLoaderInstance.getSkillByName('biyue'),
    ]);
  }
}
