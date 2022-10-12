import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { ChengXiang } from 'core/skills/characters/yijiang2013/chengxiang';
import { RenXin } from 'core/skills/characters/yijiang2013/renxin';

const skillLoaderInstance = SkillLoader.getInstance();

export class CaoChong extends Character {
  constructor(id: number) {
    super(id, 'caochong', CharacterGender.Male, CharacterNationality.Wei, 3, 3, GameCharacterExtensions.YiJiang2013, [
      skillLoaderInstance.getSkillByName(ChengXiang.Name),
      skillLoaderInstance.getSkillByName(RenXin.Name),
    ]);
  }
}
