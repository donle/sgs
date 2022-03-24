import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { PveBeiFa, PveBuXu, PveChengXiang, PveDuDu, PveFeiHua, PveZhiBing } from 'core/skills/game_mode/pve/pve_jiangliskill';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class PveJiangLiBoss extends Character {
  constructor(id: number) {
    super(id, 'pve_jiangliboss', CharacterGender.Female, CharacterNationality.God, 3, 3, GameCharacterExtensions.Pve, [
      skillLoaderInstance.getSkillByName(PveBuXu.Name),
      skillLoaderInstance.getSkillByName(PveBeiFa.Name),
      skillLoaderInstance.getSkillByName(PveDuDu.Name),
      skillLoaderInstance.getSkillByName(PveChengXiang.Name),
      skillLoaderInstance.getSkillByName(PveFeiHua.Name),
      skillLoaderInstance.getSkillByName(PveZhiBing.Name),
    ]);
  }
}
