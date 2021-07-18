import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { PveQinLv } from 'core/skills';
import { PveSuWei } from 'core/skills/game_mode/pve/pve_suwei';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class PveBiAn extends Character {
  constructor(id: number) {
    super(id, 'pve_bian', CharacterGender.Female, CharacterNationality.God, 4, 4, GameCharacterExtensions.Pve, [
      skillLoaderInstance.getSkillByName(PveSuWei.Name),
      skillLoaderInstance.getSkillByName(PveQinLv.Name),
    ]);
  }
}
