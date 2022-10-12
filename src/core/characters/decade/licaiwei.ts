import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLorderInstance = SkillLoader.getInstance();

export class LiCaiWei extends Character {
  constructor(id: number) {
    super(id, 'licaiwei', CharacterGender.Female, CharacterNationality.Qun, 3, 3, GameCharacterExtensions.Decade, [
      skillLorderInstance.getSkillByName('yijiao'),
      skillLorderInstance.getSkillByName('qibie'),
    ]);
  }
}
