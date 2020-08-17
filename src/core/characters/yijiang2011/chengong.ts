import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class ChenGong extends Character {
  constructor(id: number) {
    super(id, 'chengong', CharacterGender.Male, CharacterNationality.Qun, 3, 3, GameCharacterExtensions.YiJiang2011, [
      skillLoaderInstance.getSkillByName('mingce'),
      ...skillLoaderInstance.getSkillsByName('zhichi'),
    ]);
  }
}
