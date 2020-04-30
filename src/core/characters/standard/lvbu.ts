import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality, Lord } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

@Lord
export class LvBu extends Character {
  constructor(id: number) {
    super(id, 'lvbu', CharacterGender.Male, CharacterNationality.Qun, 4, 4, GameCharacterExtensions.Standard, [
      skillLoaderInstance.getSkillByName('liyu'),
      ...skillLoaderInstance.getSkillsByName('wushuang'),
      skillLoaderInstance.getSkillByName('cheat'),
      ...skillLoaderInstance.getSkillsByName('rende'),
    ]);
  }
}
