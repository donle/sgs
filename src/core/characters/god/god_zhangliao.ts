import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class GodZhangLiao extends Character {
  constructor(id: number) {
    super(id, 'god_zhangliao', CharacterGender.Male, CharacterNationality.God, 4, 4, GameCharacterExtensions.God, [
      ...skillLoaderInstance.getSkillsByName('duorui'),
      ...skillLoaderInstance.getSkillsByName('zhiti'),
    ]);
  }
}
