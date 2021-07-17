import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class ZhiXunChen extends Character {
  constructor(id: number) {
    super(id, 'zhi_xunchen', CharacterGender.Male, CharacterNationality.Qun, 3, 3, GameCharacterExtensions.Wisdom, [
      skillLoaderInstance.getSkillByName('jianzhan'),
      ...skillLoaderInstance.getSkillsByName('duoji'),
    ]);
  }
}
