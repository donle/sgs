import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLorderInstance = SkillLoader.getInstance();

export class ZhangLing extends Character {
  constructor(id: number) {
    super(id, 'zhangling', CharacterGender.Male, CharacterNationality.Qun, 3, 3, GameCharacterExtensions.SP, [
      ...skillLorderInstance.getSkillsByName('huji'),
      ...skillLorderInstance.getSkillsByName('shoufu'),
    ]);
  }
}
