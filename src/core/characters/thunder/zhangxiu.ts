import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLoaderInstance = SkillLoader.getInstance();

export class ZhangXiu extends Character {
  constructor(id: number) {
    super(id, 'zhangxiu', CharacterGender.Male, CharacterNationality.Qun, 4, 4, GameCharacterExtensions.Thunder, [
      skillLoaderInstance.getSkillByName('congjian'),
      ...skillLoaderInstance.getSkillsByName('xiongluan'),
    ]);
  }
}
