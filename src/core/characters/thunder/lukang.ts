import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class LuKang extends Character {
  constructor(id: number) {
    super(id, 'lukang', CharacterGender.Male, CharacterNationality.Wu, 4, 4, GameCharacterExtensions.Thunder, [
      ...skillLoaderInstance.getSkillsByName('qianjie'),
      ...skillLoaderInstance.getSkillsByName('jueyan'),
      skillLoaderInstance.getSkillByName('poshi'),
    ]);
  }
}
