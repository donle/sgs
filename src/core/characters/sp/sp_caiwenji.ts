import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLorderInstance = SkillLoader.getInstance();

export class SPCaiWenJi extends Character {
  constructor(id: number) {
    super(id, 'sp_caiwenji', CharacterGender.Female, CharacterNationality.Wei, 3, 3, GameCharacterExtensions.SP, [
      skillLorderInstance.getSkillByName('chenqing'),
      skillLorderInstance.getSkillByName('mozhi'),
    ]);
  }
}
