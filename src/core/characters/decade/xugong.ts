import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLorderInstance = SkillLoader.getInstance();

export class XuGong extends Character {
  constructor(id: number) {
    super(id, 'xugong', CharacterGender.Male, CharacterNationality.Wu, 3, 3, GameCharacterExtensions.Decade, [
      skillLorderInstance.getSkillByName('biaozhao'),
      skillLorderInstance.getSkillByName('yechou'),
    ]);
  }
}
