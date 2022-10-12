import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { DanShou } from 'core/skills';

const skillLoaderInstance = SkillLoader.getInstance();

export class ZhuRan extends Character {
  constructor(id: number) {
    super(id, 'zhuran', CharacterGender.Male, CharacterNationality.Wu, 4, 4, GameCharacterExtensions.YiJiang2013, [
      ...skillLoaderInstance.getSkillsByName(DanShou.Name),
    ]);
  }
}
