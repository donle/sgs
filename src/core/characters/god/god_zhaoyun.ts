import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class GodZhaoYun extends Character {
  constructor(id: number) {
    super(id, 'god_zhaoyun', CharacterGender.Male, CharacterNationality.God, 2, 2, GameCharacterExtensions.God, [
      ...skillLoaderInstance.getSkillsByName('juejing'),
      ...skillLoaderInstance.getSkillsByName('longhun'),
    ]);
  }
}
