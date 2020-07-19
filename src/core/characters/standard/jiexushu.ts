import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class JieXuShu extends Character {
  constructor(id: number) {
    super(id, 'jiexushu', CharacterGender.Male, CharacterNationality.Shu, 4, 4, GameCharacterExtensions.Standard, [
      skillLoaderInstance.getSkillByName('zhuhai'),
      skillLoaderInstance.getSkillByName('qianxin'),
    ]);
  }
}
