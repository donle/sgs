import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLorderInstance = SkillLoader.getInstance();

export class ZhaoZhong extends Character {
  constructor(id: number) {
    super(id, 'zhaozhong', CharacterGender.Male, CharacterNationality.Qun, 6, 6, GameCharacterExtensions.Decade, [
      skillLorderInstance.getSkillByName('yangzhong'),
      skillLorderInstance.getSkillByName('huangkong'),
    ]);
  }
}
