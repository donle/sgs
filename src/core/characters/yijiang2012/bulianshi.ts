import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLoaderInstance = SkillLoader.getInstance();

export class BuLianShi extends Character {
  constructor(id: number) {
    super(id, 'bulianshi', CharacterGender.Female, CharacterNationality.Wu, 3, 3, GameCharacterExtensions.YiJiang2012, [
      skillLoaderInstance.getSkillByName('anxu'),
      skillLoaderInstance.getSkillByName('zhuiyi'),
    ]);
  }
}
