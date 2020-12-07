import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class SunJian extends Character {
  constructor(id: number) {
    super(id, 'sunjian', CharacterGender.Male, CharacterNationality.Wu, 5, 4, GameCharacterExtensions.Forest, [
      skillLoaderInstance.getSkillByName('yinghun'),
      skillLoaderInstance.getSkillByName('wulie'),
    ]);
  }
}
