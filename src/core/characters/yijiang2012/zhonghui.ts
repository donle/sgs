import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class ZhongHui extends Character {
  constructor(id: number) {
    super(id, 'zhonghui', CharacterGender.Male, CharacterNationality.Wei, 4, 4, GameCharacterExtensions.YiJiang2012, [
      ...skillLoaderInstance.getSkillsByName('quanji'),
      skillLoaderInstance.getSkillByName('zili'),
    ]);
  }
}
