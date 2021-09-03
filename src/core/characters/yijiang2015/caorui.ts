import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality, Lord } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

@Lord
export class CaoRui extends Character {
  constructor(id: number) {
    super(id, 'caorui', CharacterGender.Male, CharacterNationality.Wei, 3, 3, GameCharacterExtensions.YiJiang2015, [
      skillLoaderInstance.getSkillByName('huituo'),
      skillLoaderInstance.getSkillByName('mingjian'),
      ...skillLoaderInstance.getSkillsByName('xingshuai'),
    ]);
  }
}
