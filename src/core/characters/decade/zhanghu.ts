import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLorderInstance = SkillLoader.getInstance();

export class ZhangHu extends Character {
  constructor(id: number) {
    super(id, 'zhanghu', CharacterGender.Male, CharacterNationality.Wei, 4, 4, GameCharacterExtensions.Decade, [
      skillLorderInstance.getSkillByName('cuijian'),
      skillLorderInstance.getSkillByName('tongyuan'),
    ]);
  }
}
