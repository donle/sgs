import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoader = SkillLoader.getInstance();

export class FuHuangHou extends Character {
  constructor(id: number) {
    super(
      id,
      'fuhuanghou',
      CharacterGender.Female,
      CharacterNationality.Qun,
      3,
      3,
      GameCharacterExtensions.YiJiang2013,
      [...skillLoader.getSkillsByName('zhuikong'), skillLoader.getSkillByName('qiuyuan')],
    );
  }
}
