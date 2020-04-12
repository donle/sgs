import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality, Lord } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

@Lord
export class ZhouYu extends Character {
  constructor(id: number) {
    super(id, 'zhouyu', CharacterGender.Male, CharacterNationality.Wu, 3, GameCharacterExtensions.Standard, [
      skillLoaderInstance.getSkillByName('yingzi'),
      skillLoaderInstance.getSkillByName('fanjian'),
    ]);
  }
}
