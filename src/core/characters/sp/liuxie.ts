import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLorderInstance = SkillLoader.getInstance();

export class LiuXie extends Character {
  constructor(id: number) {
    super(id, 'liuxie', CharacterGender.Male, CharacterNationality.Qun, 3, 3, GameCharacterExtensions.SP, [
      skillLorderInstance.getSkillByName('tianming'),
      skillLorderInstance.getSkillByName('mizhao'),
    ]);
  }
}
