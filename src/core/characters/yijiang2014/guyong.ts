import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class GuYong extends Character {
  constructor(id: number) {
    super(id, 'guyong', CharacterGender.Male, CharacterNationality.Wu, 3, 3, GameCharacterExtensions.YiJiang2014, [
      skillLoaderInstance.getSkillByName('shenxing'),
      skillLoaderInstance.getSkillByName('bingyi'),
    ]);
  }
}
