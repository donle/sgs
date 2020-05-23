import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class SunShangXiang extends Character {
  constructor(id: number) {
    super(
      id,
      'sunshangxiang',
      CharacterGender.Female,
      CharacterNationality.Wu,
      3,
      3,
      GameCharacterExtensions.Standard,
      [skillLoaderInstance.getSkillByName('jieyin'), skillLoaderInstance.getSkillByName('xiaoji')],
    );
  }
}
