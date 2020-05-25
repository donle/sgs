import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class LvMeng extends Character {
  constructor(id: number) {
    super(id, 'lvmeng', CharacterGender.Male, CharacterNationality.Wu, 4, 4, GameCharacterExtensions.Standard, [
      skillLoaderInstance.getSkillByName('keji'),
      skillLoaderInstance.getSkillByName('qinxue'),
      skillLoaderInstance.getSkillByName('botu'),
    ]);
  }
}
