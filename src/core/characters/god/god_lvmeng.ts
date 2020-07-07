import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class GodLvMeng extends Character {
  constructor(id: number) {
    super(id, 'god_lvmeng', CharacterGender.Male, CharacterNationality.God, 3, 3, GameCharacterExtensions.God, [
      skillLoaderInstance.getSkillByName('shelie'),
      skillLoaderInstance.getSkillByName('gongxin'),
    ]);
  }
}
