import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { PveRuiYan } from 'core/skills';
import { PveChaiYue } from 'core/skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class PveBiAn extends Character {
  constructor(id: number) {
    super(id, 'pve_bian', CharacterGender.Female, CharacterNationality.God, 4, 4, GameCharacterExtensions.Pve, [
      skillLoaderInstance.getSkillByName(PveChaiYue.Name),
      skillLoaderInstance.getSkillByName(PveRuiYan.Name),
    ]);
  }
}
