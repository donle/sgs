import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLorderInstance = SkillLoader.getInstance();

export class SPSunShangXiang extends Character {
  constructor(id: number) {
    super(id, 'sp_sunshangxiang', CharacterGender.Female, CharacterNationality.Shu, 3, 3, GameCharacterExtensions.SP, [
      skillLorderInstance.getSkillByName('liangzhu'),
      skillLorderInstance.getSkillByName('fanxiang'),
    ]);
  }
}
