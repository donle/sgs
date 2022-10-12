import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLoaderInstance = SkillLoader.getInstance();

export class YanYan extends Character {
  constructor(id: number) {
    super(id, 'yanyan', CharacterGender.Male, CharacterNationality.Shu, 4, 4, GameCharacterExtensions.Shadow, [
      ...skillLoaderInstance.getSkillsByName('juzhan'),
    ]);
  }
}
