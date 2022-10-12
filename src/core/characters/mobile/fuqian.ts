import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLoaderInstance = SkillLoader.getInstance();

export class FuQian extends Character {
  constructor(id: number) {
    super(id, 'fuqian', CharacterGender.Male, CharacterNationality.Shu, 4, 4, GameCharacterExtensions.Mobile, [
      ...skillLoaderInstance.getSkillsByName('poxiang'),
      skillLoaderInstance.getSkillByName('jueyong'),
    ]);
  }
}
