import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class ChenQun extends Character {
  constructor(id: number) {
    super(id, 'chenqun', CharacterGender.Male, CharacterNationality.Wei, 3, 3, GameCharacterExtensions.YiJiang2014, [
      ...skillLoaderInstance.getSkillsByName('pindi'),
      skillLoaderInstance.getSkillByName('faen'),
    ]);
  }
}
