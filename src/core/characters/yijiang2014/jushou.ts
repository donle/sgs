import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class JuShou extends Character {
  constructor(id: number) {
    super(id, 'jushou', CharacterGender.Male, CharacterNationality.Qun, 3, 3, GameCharacterExtensions.YiJiang2014, [
      skillLoaderInstance.getSkillByName('shibei'),
      skillLoaderInstance.getSkillByName('jianying'),
    ]);
  }
}
