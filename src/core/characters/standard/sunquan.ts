import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality, Lord } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

@Lord
export class SunQuan extends Character {
  constructor(id: number) {
    super(id, 'sunquan', CharacterGender.Male, CharacterNationality.Wu, 4, 4, GameCharacterExtensions.Standard, [
      skillLoaderInstance.getSkillByName('zhiheng'),
      skillLoaderInstance.getSkillByName('jiuyuan'),
    ]);
  }
}
