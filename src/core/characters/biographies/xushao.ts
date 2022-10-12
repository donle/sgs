import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLoaderInstance = SkillLoader.getInstance();

export class XuShao extends Character {
  constructor(id: number) {
    super(id, 'xushao', CharacterGender.Male, CharacterNationality.Qun, 4, 4, GameCharacterExtensions.Biographies, [
      ...skillLoaderInstance.getSkillsByName('pingjian'),
    ]);
  }
}
