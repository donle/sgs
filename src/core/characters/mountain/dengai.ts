import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class DengAi extends Character {
  constructor(id: number) {
    super(id, 'dengai', CharacterGender.Male, CharacterNationality.Wei, 4, 4, GameCharacterExtensions.Mountain, [
      ...skillLoaderInstance.getSkillsByName('tuntian'),
      skillLoaderInstance.getSkillByName('zaoxian'),
    ]);
  }
}
