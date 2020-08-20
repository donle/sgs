import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLorderInstance = SkillLoader.getInstance();

export class GaoShun extends Character {
  constructor(id: number) {
    super(id, 'gaoshun', CharacterGender.Male, CharacterNationality.Qun, 4, 4, GameCharacterExtensions.YiJiang2011, []);
  }
}
