import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class PveLongShen extends Character {
  constructor(id: number) {
    super(id, 'pve_longshen', CharacterGender.Female, CharacterNationality.God, 3, 3, GameCharacterExtensions.Pve, [
      skillLoaderInstance.getSkillByName('pve_longshen_qifu'),
    ]);
  }
}
