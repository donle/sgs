import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLoaderInstance = SkillLoader.getInstance();

export class ZhangRang extends Character {
  constructor(id: number) {
    super(id, 'zhangrang', CharacterGender.Male, CharacterNationality.Qun, 3, 3, GameCharacterExtensions.Yuan6, [
      ...skillLoaderInstance.getSkillsByName('taoluan'),
    ]);
  }
}
