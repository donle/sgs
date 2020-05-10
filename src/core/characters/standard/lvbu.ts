import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class LvBu extends Character {
  constructor(id: number) {
    super(id, 'lvbu', CharacterGender.Male, CharacterNationality.Qun, 5, 5, GameCharacterExtensions.Standard, [
      skillLoaderInstance.getSkillByName('liyu'),
      ...skillLoaderInstance.getSkillsByName('wushuang'),
    ]);
  }
}
