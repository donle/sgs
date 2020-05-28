import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class GanNing extends Character {
  constructor(id: number) {
    super(id, 'ganning', CharacterGender.Male, CharacterNationality.Wu, 4, 4, GameCharacterExtensions.Standard, [
      skillLoaderInstance.getSkillByName('qixi'),
      skillLoaderInstance.getSkillByName('fenwei'),
    ]);
  }
}
