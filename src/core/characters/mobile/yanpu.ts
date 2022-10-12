import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLoaderInstance = SkillLoader.getInstance();

export class YanPu extends Character {
  constructor(id: number) {
    super(id, 'yanpu', CharacterGender.Male, CharacterNationality.Qun, 3, 3, GameCharacterExtensions.Mobile, [
      ...skillLoaderInstance.getSkillsByName('huantu'),
      skillLoaderInstance.getSkillByName('bihuo'),
    ]);
  }
}
