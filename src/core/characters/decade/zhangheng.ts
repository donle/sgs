import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLorderInstance = SkillLoader.getInstance();

export class ZhangHeng extends Character {
  constructor(id: number) {
    super(id, 'zhangheng', CharacterGender.Male, CharacterNationality.Qun, 8, 8, GameCharacterExtensions.Decade, [
      skillLorderInstance.getSkillByName('dangzai'),
      skillLorderInstance.getSkillByName('liangjue'),
    ]);
  }
}
