import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class MaDai extends Character {
  constructor(id: number) {
    super(id, 'madai', CharacterGender.Male, CharacterNationality.Shu, 4, 4, GameCharacterExtensions.YiJiang2012, [
      skillLoaderInstance.getSkillByName('mashu'),
      ...skillLoaderInstance.getSkillsByName('qianxi'),
    ]);
  }
}
