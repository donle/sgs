import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class CaoXiu extends Character {
  constructor(id: number) {
    super(id, 'caoxiu', CharacterGender.Male, CharacterNationality.Wei, 4, 4, GameCharacterExtensions.YiJiang2015, [
      skillLoaderInstance.getSkillByName('qianju'),
      skillLoaderInstance.getSkillByName('qingxi'),
    ]);
  }
}
