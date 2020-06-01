import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class LiDian extends Character {
  constructor(id: number) {
    super(id, 'lidian', CharacterGender.Male, CharacterNationality.Wei, 3, 3, GameCharacterExtensions.Standard, [
      skillLoaderInstance.getSkillByName('xunxun'),
      skillLoaderInstance.getSkillByName('wangxi'),
    ]);
  }
}
