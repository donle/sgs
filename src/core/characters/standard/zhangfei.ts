import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class ZhangFei extends Character {
  constructor(id: number) {
    super(id, 'zhangfei', CharacterGender.Male, CharacterNationality.Shu, 4, 4, GameCharacterExtensions.Standard, [
      ...skillLoaderInstance.getSkillsByName('paoxiao'),
      skillLoaderInstance.getSkillByName('tishen'),
    ]);
  }
}
