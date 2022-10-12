import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class SiMaShi extends Character {
  constructor(id: number) {
    super(id, 'simashi', CharacterGender.Male, CharacterNationality.Wei, 4, 4, GameCharacterExtensions.Mobile, [
      skillLoaderInstance.getSkillByName('baiyi'),
      skillLoaderInstance.getSkillByName('jinglve'),
      skillLoaderInstance.getSkillByName('shanli'),
    ]);
  }
}
