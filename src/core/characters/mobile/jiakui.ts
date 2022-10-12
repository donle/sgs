import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLoaderInstance = SkillLoader.getInstance();

export class JiaKui extends Character {
  constructor(id: number) {
    super(id, 'jiakui', CharacterGender.Male, CharacterNationality.Wei, 3, 3, GameCharacterExtensions.Mobile, [
      skillLoaderInstance.getSkillByName('zhongzuo'),
      ...skillLoaderInstance.getSkillsByName('wanlan'),
    ]);
  }
}
