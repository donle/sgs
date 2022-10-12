import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLoaderInstance = SkillLoader.getInstance();

export class SunDeng extends Character {
  constructor(id: number) {
    super(id, 'sundeng', CharacterGender.Male, CharacterNationality.Wu, 4, 4, GameCharacterExtensions.Yuan6, [
      ...skillLoaderInstance.getSkillsByName('kuangbi'),
    ]);
  }
}
