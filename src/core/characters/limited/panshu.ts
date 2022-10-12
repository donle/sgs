import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLorderInstance = SkillLoader.getInstance();

export class PanShu extends Character {
  constructor(id: number) {
    super(id, 'panshu', CharacterGender.Female, CharacterNationality.Wu, 3, 3, GameCharacterExtensions.Limited, [
      skillLorderInstance.getSkillByName('weiyi'),
      ...skillLorderInstance.getSkillsByName('jinzhi'),
    ]);
  }
}
