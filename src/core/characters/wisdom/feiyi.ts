import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class FeiYi extends Character {
  constructor(id: number) {
    super(id, 'feiyi', CharacterGender.Male, CharacterNationality.Shu, 3, 3, GameCharacterExtensions.Wisdom, [
      ...skillLoaderInstance.getSkillsByName('jianyu'),
      skillLoaderInstance.getSkillByName('shengxi'),
    ]);
  }
}
