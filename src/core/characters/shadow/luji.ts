import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLoaderInstance = SkillLoader.getInstance();

export class LuJi extends Character {
  constructor(id: number) {
    super(id, 'luji', CharacterGender.Male, CharacterNationality.Wu, 3, 3, GameCharacterExtensions.Shadow, [
      skillLoaderInstance.getSkillByName('huaiju'),
      skillLoaderInstance.getSkillByName('weili'),
      skillLoaderInstance.getSkillByName('zhenglun'),
    ]);
  }
}
