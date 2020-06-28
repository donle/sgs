import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class XunYu extends Character {
  constructor(id: number) {
    super(id, 'xunyu', CharacterGender.Male, CharacterNationality.Wei, 3, 3, GameCharacterExtensions.Fire, [
      skillLoaderInstance.getSkillByName('quhu'),
      skillLoaderInstance.getSkillByName('jieming'),
    ]);
  }
}
