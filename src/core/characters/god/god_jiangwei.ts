import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLoaderInstance = SkillLoader.getInstance();

export class GodJiangWei extends Character {
  constructor(id: number) {
    super(id, 'god_jiangwei', CharacterGender.Male, CharacterNationality.God, 4, 4, GameCharacterExtensions.God, [
      ...skillLoaderInstance.getSkillsByName('tianren'),
      ...skillLoaderInstance.getSkillsByName('jiufa'),
      ...skillLoaderInstance.getSkillsByName('pingxiang'),
    ]);
  }
}
