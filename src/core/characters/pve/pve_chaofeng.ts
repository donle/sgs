import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { PveJieNu } from 'core/skills';
import { PveLongLin } from 'core/skills/game_mode/pve/pve_longlin';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class PveChaoFeng extends Character {
  constructor(id: number) {
    super(id, 'pve_chaofeng', CharacterGender.Female, CharacterNationality.God, 4, 4, GameCharacterExtensions.Pve, [
      ...skillLoaderInstance.getSkillsByName(PveLongLin.Name),
      skillLoaderInstance.getSkillByName(PveJieNu.Name),
    ]);
  }
}
