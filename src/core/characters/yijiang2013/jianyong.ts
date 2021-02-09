import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { J3ZongShi, QiaoShui } from 'core/skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();
export class JianYong extends Character {
  constructor(id: number) {
    super(id, 'jianyong', CharacterGender.Male, CharacterNationality.Shu, 3, 3, GameCharacterExtensions.YiJiang2012, [
      ...skillLoaderInstance.getSkillsByName(QiaoShui.Name),
      skillLoaderInstance.getSkillByName(J3ZongShi.Name),
    ]);
  }
}
