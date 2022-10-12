import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class YuanShu extends Character {
  constructor(id: number) {
    super(id, 'yuanshu', CharacterGender.Male, CharacterNationality.Qun, 4, 4, GameCharacterExtensions.Standard, [
      ...skillLoaderInstance.getSkillsByName('wangzun'),
      skillLoaderInstance.getSkillByName('tongji'),
    ]);
  }
}
