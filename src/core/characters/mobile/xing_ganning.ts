import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLoaderInstance = SkillLoader.getInstance();

export class XingGanNing extends Character {
  constructor(id: number) {
    super(id, 'xing_ganning', CharacterGender.Male, CharacterNationality.Qun, 4, 4, GameCharacterExtensions.Mobile, [
      ...skillLoaderInstance.getSkillsByName('jinfan'),
      skillLoaderInstance.getSkillByName('sheque'),
    ]);
  }
}
