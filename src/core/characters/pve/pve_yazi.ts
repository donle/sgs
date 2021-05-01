import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { PveLongLie } from 'core/skills/game_mode/pve/pve_longlie';

const skillLoaderInstance = SkillLoader.getInstance();

export class PveYaZi extends Character {
  constructor(id: number) {
    super(id, 'pve_yazi', CharacterGender.Female, CharacterNationality.God, 4, 4, GameCharacterExtensions.Pve, [
      ...skillLoaderInstance.getSkillsByName(PveLongLie.Name),
    ]);
  }
}
