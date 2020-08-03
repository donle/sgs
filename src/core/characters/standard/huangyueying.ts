import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class HuangYueYing extends Character {
  constructor(id: number) {
    super(
      id,
      'huangyueying',
      CharacterGender.Female,
      CharacterNationality.Shu,
      3,
      3,
      GameCharacterExtensions.Standard,
      [skillLoaderInstance.getSkillByName('jizhi'), ...skillLoaderInstance.getSkillsByName('qicai')],
    );
  }
}
