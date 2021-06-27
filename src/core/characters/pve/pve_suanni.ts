import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { PveRuiYan } from 'core/skills/game_mode/pve/pve_ruiyan';
import { PveQinLv } from 'core/skills';

const skillLoaderInstance = SkillLoader.getInstance();

export class PveSuanNi extends Character {
  constructor(id: number) {
    super(id, 'pve_suanni', CharacterGender.Female, CharacterNationality.God, 4, 4, GameCharacterExtensions.Pve, [
      skillLoaderInstance.getSkillByName(PveRuiYan.Name),
      skillLoaderInstance.getSkillByName(PveQinLv.Name),
    ]);
  }
}
