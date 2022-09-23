import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class XuShi extends Character {
  constructor(id: number) {
    super(id, 'xushi', CharacterGender.Female, CharacterNationality.Wu, 3, 3, GameCharacterExtensions.Yuan7, [
      ...skillLoaderInstance.getSkillsByName('wengua'),
      skillLoaderInstance.getSkillByName('fuzhu'),
    ]);
  }
}
