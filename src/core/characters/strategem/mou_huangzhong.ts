import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLoaderInstance = SkillLoader.getInstance();

export class MouHuangZhong extends Character {
  constructor(id: number) {
    super(
      id,
      'mou_huangzhong',
      CharacterGender.Male,
      CharacterNationality.Shu,
      4,
      4,
      GameCharacterExtensions.Strategem,
      [...skillLoaderInstance.getSkillsByName('mou_liegong')],
    );
  }
}
