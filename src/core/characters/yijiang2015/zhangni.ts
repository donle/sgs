import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class ZhangNi extends Character {
  constructor(id: number) {
    super(id, 'zhangni', CharacterGender.Male, CharacterNationality.Shu, 5, 5, GameCharacterExtensions.YiJiang2015, [
      skillLoaderInstance.getSkillByName('wurong'),
      ...skillLoaderInstance.getSkillsByName('shizhi'),
    ]);
  }
}
