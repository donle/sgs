import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class MaSu extends Character {
  constructor(id: number) {
    super(id, 'masu', CharacterGender.Male, CharacterNationality.Shu, 3, 3, GameCharacterExtensions.YiJiang2011, [
      skillLoaderInstance.getSkillByName('sanyao'),
      skillLoaderInstance.getSkillByName('zhiman'),
    ]);
  }
}
