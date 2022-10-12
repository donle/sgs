import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLoaderInstance = SkillLoader.getInstance();

export class ZhuGeZhan extends Character {
  constructor(id: number) {
    super(id, 'zhugezhan', CharacterGender.Male, CharacterNationality.Shu, 3, 3, GameCharacterExtensions.Thunder, [
      skillLoaderInstance.getSkillByName('zuilun'),
      ...skillLoaderInstance.getSkillsByName('fuyin'),
    ]);
  }
}
