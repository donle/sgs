import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { PveBiBao, PveLongHou } from 'core/skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class PveYaZi extends Character {
  constructor(id: number) {
    super(id, 'pve_yazi', CharacterGender.Female, CharacterNationality.God, 4, 4, GameCharacterExtensions.Pve, [
      skillLoaderInstance.getSkillByName(PveBiBao.Name),
      skillLoaderInstance.getSkillByName(PveLongHou.Name),
    ]);
  }
}
