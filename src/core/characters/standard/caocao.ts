import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class CaoCao extends Character {
  constructor(id: number) {
    super(
      id,
      'caocao',
      CharacterGender.Male,
      CharacterNationality.Wei,
      4,
      GameCharacterExtensions.Standard,
      [
        skillLoaderInstance.getSkillByName('jianxiong'),
        skillLoaderInstance.getSkillByName('hujia'),
      ],
    );
  }
}
