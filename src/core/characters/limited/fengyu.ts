import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLorderInstance = SkillLoader.getInstance();

export class FengYu extends Character {
  constructor(id: number) {
    super(id, 'fengyu', CharacterGender.Female, CharacterNationality.Qun, 3, 3, GameCharacterExtensions.Limited, [
      skillLorderInstance.getSkillByName('tiqi'),
      skillLorderInstance.getSkillByName('baoshu'),
    ]);
  }
}
