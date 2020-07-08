import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class GodZhouYu extends Character {
  constructor(id: number) {
    super(id, 'god_zhouyu', CharacterGender.Male, CharacterNationality.God, 4, 4, GameCharacterExtensions.God, [
      skillLoaderInstance.getSkillByName('qinyin'),
      skillLoaderInstance.getSkillByName('yeyan'),
    ]);
  }
}
