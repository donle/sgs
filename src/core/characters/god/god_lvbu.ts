import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class GodLvBu extends Character {
  constructor(id: number) {
    super(id, 'god_lvbu', CharacterGender.Male, CharacterNationality.God, 5, 5, GameCharacterExtensions.God, [
      skillLoaderInstance.getSkillByName('kuangbao'),
      skillLoaderInstance.getSkillByName('wumou'),
      skillLoaderInstance.getSkillByName('shenfen'),
      ...skillLoaderInstance.getSkillsByName('wuqian'),
    ]);
  }
}
