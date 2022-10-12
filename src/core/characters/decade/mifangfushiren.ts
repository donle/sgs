import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLorderInstance = SkillLoader.getInstance();

export class MiFangFuShiRen extends Character {
  constructor(id: number) {
    super(id, 'mifangfushiren', CharacterGender.Male, CharacterNationality.Shu, 4, 4, GameCharacterExtensions.Decade, [
      skillLorderInstance.getSkillByName('fengshi'),
    ]);
  }
}
