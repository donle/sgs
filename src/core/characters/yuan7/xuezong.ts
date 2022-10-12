import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLoaderInstance = SkillLoader.getInstance();

export class XueZong extends Character {
  constructor(id: number) {
    super(id, 'xuezong', CharacterGender.Male, CharacterNationality.Wu, 3, 3, GameCharacterExtensions.Yuan7, [
      skillLoaderInstance.getSkillByName('funan'),
      skillLoaderInstance.getSkillByName('jiexun'),
    ]);
  }
}
