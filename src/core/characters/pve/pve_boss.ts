import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { PveHuaShen, PveTanSuo} from 'core/skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class PveBoss extends Character {
  constructor(id: number) {
    super(id, 'pve_boss', CharacterGender.Female, CharacterNationality.God, 3, 3, GameCharacterExtensions.Pve, [
      skillLoaderInstance.getSkillByName(PveHuaShen.Name),
      ...skillLoaderInstance.getSkillsByName(PveTanSuo.Name)
    ]);
  }
}
