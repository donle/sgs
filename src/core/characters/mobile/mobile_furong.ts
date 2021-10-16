import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class MobileFuRong extends Character {
  constructor(id: number) {
    super(id, 'mobile_furong', CharacterGender.Male, CharacterNationality.Shu, 4, 4, GameCharacterExtensions.Mobile, [
      ...skillLoaderInstance.getSkillsByName('xuewei'),
      skillLoaderInstance.getSkillByName('liechi'),
    ]);
  }
}
