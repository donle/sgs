import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLoaderInstance = SkillLoader.getInstance();

export class XiaHouShi extends Character {
  constructor(id: number) {
    super(
      id,
      'xiahoushi',
      CharacterGender.Female,
      CharacterNationality.Shu,
      3,
      3,
      GameCharacterExtensions.YiJiang2015,
      [skillLoaderInstance.getSkillByName('qiaoshi'), ...skillLoaderInstance.getSkillsByName('yanyu')],
    );
  }
}
