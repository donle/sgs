import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLorderInstance = SkillLoader.getInstance();

export class WangShuang extends Character {
  constructor(id: number) {
    super(id, 'wangshuang', CharacterGender.Male, CharacterNationality.Wei, 8, 8, GameCharacterExtensions.Limited, [
      ...skillLorderInstance.getSkillsByName('zhuilie'),
    ]);
  }
}
