import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLorderInstance = SkillLoader.getInstance();

export class DecadeHuangChengYan extends Character {
  constructor(id: number) {
    super(
      id,
      'decade_huangchengyan',
      CharacterGender.Male,
      CharacterNationality.Qun,
      4,
      4,
      GameCharacterExtensions.Decade,
      [skillLorderInstance.getSkillByName('jiezhen'), skillLorderInstance.getSkillByName('decade_yinshi')],
    );
  }
}
