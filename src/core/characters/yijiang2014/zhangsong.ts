import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class ZhangSong extends Character {
  constructor(id: number) {
    super(id, 'zhangsong', CharacterGender.Male, CharacterNationality.Shu, 3, 3, GameCharacterExtensions.YiJiang2014, [
      ...skillLoaderInstance.getSkillsByName('qiangzhi'),
      ...skillLoaderInstance.getSkillsByName('xiantu'),
    ]);
  }
}
