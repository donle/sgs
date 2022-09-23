import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class XingHuangZhong extends Character {
  constructor(id: number) {
    super(id, 'xing_huangzhong', CharacterGender.Male, CharacterNationality.Qun, 4, 4, GameCharacterExtensions.Mobile, [
      ...skillLoaderInstance.getSkillsByName('shidi'),
      skillLoaderInstance.getSkillByName('xing_yishi'),
      ...skillLoaderInstance.getSkillsByName('qishe'),
    ]);
  }
}
