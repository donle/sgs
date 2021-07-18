import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { PveRuiYan } from 'core/skills/game_mode/pve/pve_ruiyan';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class PveSuanNi extends Character {
  constructor(id: number) {
    super(id, 'pve_suanni', CharacterGender.Female, CharacterNationality.God, 4, 4, GameCharacterExtensions.Pve, [
      skillLoaderInstance.getSkillByName(PveRuiYan.Name),
    ]);
  }
}
