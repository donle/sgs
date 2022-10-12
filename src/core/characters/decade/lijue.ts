import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLorderInstance = SkillLoader.getInstance();

export class LiJue extends Character {
  constructor(id: number) {
    super(id, 'lijue', CharacterGender.Male, CharacterNationality.Qun, 6, 4, GameCharacterExtensions.Decade, [
      skillLorderInstance.getSkillByName('langxi'),
      skillLorderInstance.getSkillByName('yisuan'),
    ]);
  }
}
