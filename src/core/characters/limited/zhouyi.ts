import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLorderInstance = SkillLoader.getInstance();

export class ZhouYi extends Character {
  constructor(id: number) {
    super(id, 'zhouyi', CharacterGender.Female, CharacterNationality.Wu, 3, 3, GameCharacterExtensions.Limited, [
      ...skillLorderInstance.getSkillsByName('zhukou'),
      skillLorderInstance.getSkillByName('mangqing'),
    ]);
  }
}
