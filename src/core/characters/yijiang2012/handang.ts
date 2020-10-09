import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class HanDang extends Character {
  constructor(id: number) {
    super(id, 'handang', CharacterGender.Male, CharacterNationality.Wu, 4, 4, GameCharacterExtensions.YiJiang2012, [
      ...skillLoaderInstance.getSkillsByName('gongji'),
      skillLoaderInstance.getSkillByName('jiefan'),
    ]);
  }
}
