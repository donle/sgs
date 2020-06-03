import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class CaoZhang extends Character {
  constructor(id: number) {
    super(id, 'caozhang', CharacterGender.Male, CharacterNationality.Wei, 4, 4, GameCharacterExtensions.Standard, [
      ...skillLoaderInstance.getSkillsByName('jiangchi'),
    ]);
  }
}
