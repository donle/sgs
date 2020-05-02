import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class YiJi extends Character {
  constructor(id: number) {
    super(id, 'yiji_c', CharacterGender.Male, CharacterNationality.Shu, 3, 3, GameCharacterExtensions.Standard, [
      skillLoaderInstance.getSkillByName('jijie'),
      skillLoaderInstance.getSkillByName('jiyuan'),
    ]);
  }
}
