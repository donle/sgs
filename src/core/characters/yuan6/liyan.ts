import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLoaderInstance = SkillLoader.getInstance();

export class LiYan extends Character {
  constructor(id: number) {
    super(id, 'liyan', CharacterGender.Male, CharacterNationality.Shu, 3, 3, GameCharacterExtensions.Yuan6, [
      skillLoaderInstance.getSkillByName('duliang'),
      ...skillLoaderInstance.getSkillsByName('fulin'),
    ]);
  }
}
