import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { PveLongShi, PveQinLv } from 'core/skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class PveFuXi extends Character {
  constructor(id: number) {
    super(id, 'pve_fuxi', CharacterGender.Female, CharacterNationality.God, 4, 4, GameCharacterExtensions.Pve, [
      skillLoaderInstance.getSkillByName(PveLongShi.Name),
      skillLoaderInstance.getSkillByName(PveQinLv.Name),
    ]);
  }
}
