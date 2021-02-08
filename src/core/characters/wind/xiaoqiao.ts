import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class XiaoQiao extends Character {
  constructor(id: number) {
    super(id, 'xiaoqiao', CharacterGender.Female, CharacterNationality.Wu, 3, 3, GameCharacterExtensions.Wind, [
      ...skillLoaderInstance.getSkillsByName('hongyan'),
      skillLoaderInstance.getSkillByName('tianxiang'),
      skillLoaderInstance.getSkillByName('piaoling'),
    ]);
  }
}
