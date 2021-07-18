import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { PveLongHou } from 'core/skills';
import { PveLingXi } from 'core/skills/game_mode/pve/pve_lingxi';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class PveBiXi extends Character {
  constructor(id: number) {
    super(id, 'pve_bixi', CharacterGender.Female, CharacterNationality.God, 4, 4, GameCharacterExtensions.Pve, [
      ...skillLoaderInstance.getSkillsByName(PveLingXi.Name),
      skillLoaderInstance.getSkillByName(PveLongHou.Name),
    ]);
  }
}
