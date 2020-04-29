import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class LuXun extends Character {
  constructor(id: number) {
    super(id, 'luxun', CharacterGender.Male, CharacterNationality.Wu, 3, 3, GameCharacterExtensions.Standard, [
      ...skillLoaderInstance.getSkillsByName('qianxun'),
      skillLoaderInstance.getSkillByName('lianying'),
    ]);
  }
}
