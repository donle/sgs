import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLoaderInstance = SkillLoader.getInstance();

export class ChenDao extends Character {
  constructor(id: number) {
    super(id, 'chendao', CharacterGender.Male, CharacterNationality.Shu, 4, 4, GameCharacterExtensions.Thunder, [
      ...skillLoaderInstance.getSkillsByName('wanglie'),
    ]);
  }
}
