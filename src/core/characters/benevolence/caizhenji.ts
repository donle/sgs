import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLoaderInstance = SkillLoader.getInstance();

export class CaiZhenJi extends Character {
  constructor(id: number) {
    super(
      id,
      'caizhenji',
      CharacterGender.Female,
      CharacterNationality.Wei,
      3,
      3,
      GameCharacterExtensions.Benevolence,
      [skillLoaderInstance.getSkillByName('sheyi'), skillLoaderInstance.getSkillByName('tianyin')],
    );
  }
}
