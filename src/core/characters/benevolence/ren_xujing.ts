import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLoaderInstance = SkillLoader.getInstance();

export class RenXuJing extends Character {
  constructor(id: number) {
    super(id, 'ren_xujing', CharacterGender.Male, CharacterNationality.Shu, 3, 3, GameCharacterExtensions.Benevolence, [
      ...skillLoaderInstance.getSkillsByName('boming'),
      skillLoaderInstance.getSkillByName('ejian'),
    ]);
  }
}
