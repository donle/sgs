import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLorderInstance = SkillLoader.getInstance();

export class YangWan extends Character {
  constructor(id: number) {
    super(id, 'yangwan', CharacterGender.Female, CharacterNationality.Shu, 3, 3, GameCharacterExtensions.Limited, [
      skillLorderInstance.getSkillByName('youyan'),
      skillLorderInstance.getSkillByName('zhuihuan'),
    ]);
  }
}
