import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class CaoZhi extends Character {
  constructor(id: number) {
    super(id, 'caozhi', CharacterGender.Male, CharacterNationality.Wei, 3, 3, GameCharacterExtensions.YiJiang2011, [
      skillLoaderInstance.getSkillByName('luoying'),
      ...skillLoaderInstance.getSkillsByName('jiushi'),
      skillLoaderInstance.getSkillByName('chengzhang'),
    ]);
  }
}
