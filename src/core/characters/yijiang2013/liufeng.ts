import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { XianSi } from 'core/skills';

const skillLoaderInstance = SkillLoader.getInstance();

export class LiuFeng extends Character {
  constructor(id: number) {
    super(id, 'liufeng', CharacterGender.Male, CharacterNationality.Shu, 4, 4, GameCharacterExtensions.YiJiang2013, [
      ...skillLoaderInstance.getSkillsByName(XianSi.Name),
    ]);
  }
}
