import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLoaderInstance = SkillLoader.getInstance();

export class GuanYu extends Character {
  constructor(id: number) {
    super(id, 'guanyu', CharacterGender.Male, CharacterNationality.Shu, 4, 4, GameCharacterExtensions.Standard, [
      ...skillLoaderInstance.getSkillsByName('wusheng'),
      ...skillLoaderInstance.getSkillsByName('yijue'),
    ]);
  }
}
