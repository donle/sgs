import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class ZhiDuYu extends Character {
  constructor(id: number) {
    super(id, 'zhi_duyu', CharacterGender.Male, CharacterNationality.Qun, 4, 4, GameCharacterExtensions.Wisdom, [
      skillLoaderInstance.getSkillByName('wuku'),
      skillLoaderInstance.getSkillByName('zhi_sanchen'),
    ]);
  }
}
