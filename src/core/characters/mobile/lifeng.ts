import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class LiFeng extends Character {
  constructor(id: number) {
    super(id, 'lifeng', CharacterGender.Male, CharacterNationality.Shu, 3, 3, GameCharacterExtensions.Mobile, [
      ...skillLoaderInstance.getSkillsByName('tunchu'),
      skillLoaderInstance.getSkillByName('shuliang'),
    ]);
  }
}
