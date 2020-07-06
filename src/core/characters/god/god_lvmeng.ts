import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality, Lord } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class GodLvMeng extends Character {
  constructor(id: number) {
    super(id, 'god_lvmeng', CharacterGender.Male, CharacterNationality.God, 4, 4, GameCharacterExtensions.God, [
      ...skillLoaderInstance.getSkillsByName('shelie'),
      skillLoaderInstance.getSkillByName('gongxin'),
    ]);
  }
}
