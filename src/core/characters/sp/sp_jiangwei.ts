import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLorderInstance = SkillLoader.getInstance();

export class SPJiangWei extends Character {
  constructor(id: number) {
    super(id, 'sp_jiangwei', CharacterGender.Male, CharacterNationality.Wei, 4, 4, GameCharacterExtensions.SP, [
      skillLorderInstance.getSkillByName('kunfen'),
      skillLorderInstance.getSkillByName('fengliang'),
    ]);
  }
}
