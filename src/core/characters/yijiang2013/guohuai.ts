import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { JingCe } from 'core/skills/characters/yijiang2013/jingce';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class GuoHuai extends Character {
  constructor(id: number) {
    super(id, 'guohuai', CharacterGender.Male, CharacterNationality.Wei, 4, 4, GameCharacterExtensions.YiJiang2013, [
      skillLoaderInstance.getSkillByName(JingCe.Name),
    ]);
  }
}
