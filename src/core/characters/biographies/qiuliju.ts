import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class QiuLiJu extends Character {
  constructor(id: number) {
    super(id, 'qiuliju', CharacterGender.Male, CharacterNationality.Qun, 6, 4, GameCharacterExtensions.Biographies, [
      skillLoaderInstance.getSkillByName('koulve'),
      skillLoaderInstance.getSkillByName('suiren'),
    ]);
  }
}
