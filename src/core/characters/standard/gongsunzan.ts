import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class GongSunZan extends Character {
  constructor(id: number) {
    super(id, 'gongsunzan', CharacterGender.Male, CharacterNationality.Qun, 4, 4, GameCharacterExtensions.Standard, [
      skillLoaderInstance.getSkillByName('yicong'),
      skillLoaderInstance.getSkillByName('qiaomeng'),
    ]);
  }
}
