import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class HuaXiong extends Character {
  constructor(id: number) {
    super(id, 'huaxiong', CharacterGender.Male, CharacterNationality.Qun, 6, 6, GameCharacterExtensions.Standard, [
      skillLoaderInstance.getSkillByName('yaowu'),
    ]);
  }
}
