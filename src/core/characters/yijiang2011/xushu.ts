import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class XuShu extends Character {
  constructor(id: number) {
    super(id, 'xushu', CharacterGender.Male, CharacterNationality.Shu, 3, 3, GameCharacterExtensions.YiJiang2011, [
      skillLoaderInstance.getSkillByName('wuyan'),
      skillLoaderInstance.getSkillByName('jujian'),
    ]);
  }
}
