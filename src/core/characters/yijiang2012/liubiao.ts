import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class LiuBiao extends Character {
  constructor(id: number) {
    super(id, 'liubiao', CharacterGender.Male, CharacterNationality.Qun, 3, 3, GameCharacterExtensions.YiJiang2012, [
      ...skillLoaderInstance.getSkillsByName('zishou'),
      ...skillLoaderInstance.getSkillsByName('zongshi'),
    ]);
  }
}
