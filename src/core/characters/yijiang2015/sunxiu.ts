import { Character, CharacterGender, CharacterNationality, Lord } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLoaderInstance = SkillLoader.getInstance();

@Lord
export class SunXiu extends Character {
  constructor(id: number) {
    super(id, 'sunxiu', CharacterGender.Male, CharacterNationality.Wu, 3, 3, GameCharacterExtensions.YiJiang2015, [
      skillLoaderInstance.getSkillByName('yanzhu'),
      skillLoaderInstance.getSkillByName('xingxue'),
      skillLoaderInstance.getSkillByName('zhaofu'),
    ]);
  }
}
