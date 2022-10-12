import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLorderInstance = SkillLoader.getInstance();

export class XuRong extends Character {
  constructor(id: number) {
    super(id, 'xurong', CharacterGender.Male, CharacterNationality.Qun, 4, 4, GameCharacterExtensions.Limited, [
      ...skillLorderInstance.getSkillsByName('xionghuo'),
      skillLorderInstance.getSkillByName('shajue'),
    ]);
  }
}
