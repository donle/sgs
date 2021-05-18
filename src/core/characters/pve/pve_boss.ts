import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { CharacterGender, CharacterNationality, Character } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { PveHuaShen } from 'core/skills';

const skillLoaderInstance = SkillLoader.getInstance();

export class PveBoss extends Character {
  constructor(id: number) {
    super(id, 'pve_boss', CharacterGender.Female, CharacterNationality.God, 3, 3, GameCharacterExtensions.Pve, [
      skillLoaderInstance.getSkillByName(PveHuaShen.Name),
    ]);
  }
}
