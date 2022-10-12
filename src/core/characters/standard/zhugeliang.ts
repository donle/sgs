import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class ZhuGeLiang extends Character {
  constructor(id: number) {
    super(id, 'zhugeliang', CharacterGender.Male, CharacterNationality.Shu, 3, 3, GameCharacterExtensions.Standard, [
      skillLoaderInstance.getSkillByName('guanxing'),
      skillLoaderInstance.getSkillByName('kongcheng'),
    ]);
  }
}
