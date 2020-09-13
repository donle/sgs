import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { AnJian } from 'core/skills/characters/yijiang2013/anjian';
import { DuoDao } from 'core/skills/characters/yijiang2013/duodao';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class PanZhangMaZhong extends Character {
  constructor(id: number) {
    super(id, 'panzhangmazhong', CharacterGender.Male, CharacterNationality.Wu, 4, 4, GameCharacterExtensions.YiJiang2013, [
      skillLoaderInstance.getSkillByName(AnJian.Name),
      skillLoaderInstance.getSkillByName(DuoDao.Name),
    ]);
  }
}
