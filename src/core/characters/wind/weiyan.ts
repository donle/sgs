import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class Weiyan extends Character {
  constructor(id: number) {
    super(id, 'weiyan', CharacterGender.Male, CharacterNationality.Shu, 4, 4, GameCharacterExtensions.Wind, [
      ...skillLoaderInstance.getSkillsByName('kuanggu'),
    ]);
  }
}
