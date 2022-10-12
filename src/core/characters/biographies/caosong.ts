import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLoaderInstance = SkillLoader.getInstance();

export class CaoSong extends Character {
  constructor(id: number) {
    super(id, 'caosong', CharacterGender.Male, CharacterNationality.Wei, 4, 4, GameCharacterExtensions.Biographies, [
      skillLoaderInstance.getSkillByName('lilu'),
      ...skillLoaderInstance.getSkillsByName('yizheng'),
    ]);
  }
}
