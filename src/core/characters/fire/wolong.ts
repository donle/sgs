import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class WoLong extends Character {
  constructor(id: number) {
    super(id, 'wolong', CharacterGender.Male, CharacterNationality.Shu, 3, 3, GameCharacterExtensions.Fire, [
      skillLoaderInstance.getSkillByName('bazhen'),
      skillLoaderInstance.getSkillByName('huoji'),
      skillLoaderInstance.getSkillByName('kanpo'),
      ...skillLoaderInstance.getSkillsByName('cangzhuo'),
    ]);
  }
}
