import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLoaderInstance = SkillLoader.getInstance();

export class SunRu extends Character {
  constructor(id: number) {
    super(id, 'sunru', CharacterGender.Female, CharacterNationality.Wu, 3, 3, GameCharacterExtensions.Mobile, [
      skillLoaderInstance.getSkillByName('yingjian'),
      skillLoaderInstance.getSkillByName('shixin'),
    ]);
  }
}
