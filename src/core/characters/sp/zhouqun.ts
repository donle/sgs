import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLorderInstance = SkillLoader.getInstance();

export class ZhouQun extends Character {
  constructor(id: number) {
    super(id, 'zhouqun', CharacterGender.Male, CharacterNationality.Shu, 3, 3, GameCharacterExtensions.SP, [
      ...skillLorderInstance.getSkillsByName('tiansuan'),
    ]);
  }
}
