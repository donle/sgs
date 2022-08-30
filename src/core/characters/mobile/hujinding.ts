import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class HuJinDing extends Character {
  constructor(id: number) {
    super(id, 'hujinding', CharacterGender.Female, CharacterNationality.Shu, 6, 2, GameCharacterExtensions.Mobile, [
      skillLoaderInstance.getSkillByName('renshi'),
      skillLoaderInstance.getSkillByName('wuyuan'),
      skillLoaderInstance.getSkillByName('huaizi'),
    ]);
  }
}
