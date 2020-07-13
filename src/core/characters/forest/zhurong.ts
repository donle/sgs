import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class ZhuRong extends Character {
  constructor(id: number) {
    super(id, 'zhurong', CharacterGender.Female, CharacterNationality.Shu, 4, 4, GameCharacterExtensions.Forest, [
      skillLoaderInstance.getSkillByName('juxiang'),
      skillLoaderInstance.getSkillByName('lieren'),
    ]);
  }
}
