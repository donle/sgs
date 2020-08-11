import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class XuSheng extends Character {
  constructor(id: number) {
    super(id, 'xusheng', CharacterGender.Male, CharacterNationality.Wu, 4, 4, GameCharacterExtensions.YiJiang2011, [
      ...skillLoaderInstance.getSkillsByName('pojun'),
    ]);
  }
}
