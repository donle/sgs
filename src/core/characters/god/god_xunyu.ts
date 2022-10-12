import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLoaderInstance = SkillLoader.getInstance();

export class GodXunYu extends Character {
  constructor(id: number) {
    super(id, 'god_xunyu', CharacterGender.Male, CharacterNationality.God, 3, 3, GameCharacterExtensions.God, [
      ...skillLoaderInstance.getSkillsByName('tianzuo'),
      skillLoaderInstance.getSkillByName('lingce'),
      skillLoaderInstance.getSkillByName('dinghan'),
    ]);
  }
}
